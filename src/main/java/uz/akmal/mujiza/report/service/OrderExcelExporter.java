package uz.akmal.mujiza.report.service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.order.dto.OrderFilter;
import uz.akmal.mujiza.order.entity.CustomerOrder;
import uz.akmal.mujiza.order.entity.OrderItem;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.enums.PaymentMethod;
import uz.akmal.mujiza.order.repository.CustomerOrderRepository;
import uz.akmal.mujiza.order.specification.OrderSpecifications;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Buyurtmalar ro'yxatini Excel (.xlsx) fayliga aylantiradi. Filtrlar buyurtmalar ro'yxatidagi bilan bir xil.
 * Ustun kengliklari qo'lda belgilanadi (avtomatik moslash serverda shriftlar yo'qligida xato beradi).
 */
@Service
@RequiredArgsConstructor
public class OrderExcelExporter {

    /**
     * Faylga yoziladigan eng ko'p buyurtma soni (juda katta fayl serverni og'irlashtirmasligi uchun).
     */
    private static final int MAX_ROWS = 5000;

    /**
     * Bitta katakka yoziladigan matnning eng uzun hajmi (mahsulotlar ro'yxati uchun).
     */
    private static final int MAX_CELL_TEXT = 2000;

    /**
     * Ustun sarlavhalari.
     */
    private static final String[] HEADERS = {"№", "Buyurtma", "Sana", "Holat", "Tur", "Mijoz", "Telefon",
            "Olish joyi / manzil", "To'lov", "Tarkib", "Mahsulotlar summasi", "Chegirma", "Promo kod",
            "Yetkazish", "Jami", "Sovg'a", "Tort", "Izoh"};

    /**
     * Ustun kengliklari (belgilar soni bilan).
     */
    private static final int[] WIDTHS = {6, 12, 18, 16, 14, 22, 16, 36, 10, 60, 18, 12, 14, 12, 14, 8, 8, 30};

    /**
     * Buyurtmalarni o'qish uchun.
     */
    private final CustomerOrderRepository orderRepository;

    /**
     * Filtrga mos buyurtmalarni (eng yangisi birinchi) Excel faylga yozib, baytlarini qaytaradi.
     *
     * @param filter filtr shartlari (holat, tur, qidiruv, sana)
     * @return .xlsx fayl baytlari
     */
    @Transactional(readOnly = true)
    public byte[] export(OrderFilter filter) {
        if (filter != null && filter.dateFrom() != null && filter.dateTo() != null
                && filter.dateFrom().isAfter(filter.dateTo())) {
            throw new BusinessException("Boshlanish sanasi tugash sanasidan keyin bo'lishi mumkin emas");
        }
        PageRequest pageable = PageRequest.of(0, MAX_ROWS,
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
        List<CustomerOrder> orders = orderRepository.findAll(OrderSpecifications.from(filter), pageable).getContent();

        SXSSFWorkbook workbook = new SXSSFWorkbook(100);
        workbook.setCompressTempFiles(true);
        try (workbook; ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Buyurtmalar");

            // Uslublar: sarlavha (qalin, kulrang), pul (3 xonadan ajratilgan), sana-vaqt
            Font bold = workbook.createFont();
            bold.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(bold);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            CellStyle moneyStyle = workbook.createCellStyle();
            moneyStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0"));
            CellStyle boldMoneyStyle = workbook.createCellStyle();
            boldMoneyStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0"));
            boldMoneyStyle.setFont(bold);
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(workbook.createDataFormat().getFormat("dd.mm.yyyy hh:mm"));

            // Sarlavha qatori
            Row header = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, WIDTHS[i] * 256);
            }

            // Ma'lumot qatorlari; bekor qilinmagan buyurtmalar summalari jami qatorga yig'iladi
            long sumItems = 0;
            long sumDiscount = 0;
            long sumDelivery = 0;
            long sumTotal = 0;
            int rowIndex = 1;
            for (CustomerOrder order : orders) {
                Row row = sheet.createRow(rowIndex);
                int c = 0;
                row.createCell(c++).setCellValue(rowIndex);
                text(row, c++, order.getOrderNumber());
                Cell dateCell = row.createCell(c++);
                dateCell.setCellValue(order.getCreatedAt());
                dateCell.setCellStyle(dateStyle);
                text(row, c++, statusLabel(order.getStatus()));
                text(row, c++, order.getOrderType() == OrderType.PICKUP ? "Olib ketish" : "Yetkazish");
                text(row, c++, order.getCustomerName());
                text(row, c++, order.getCustomerPhone());
                text(row, c++, place(order));
                text(row, c++, order.getPaymentMethod() == PaymentMethod.CASH ? "Naqd" : "Karta");
                text(row, c++, itemsText(order));
                money(row, c++, order.getItemsTotal(), moneyStyle);
                money(row, c++, order.getDiscountAmount(), moneyStyle);
                text(row, c++, order.getPromoCode());
                money(row, c++, order.getDeliveryFee(), moneyStyle);
                money(row, c++, order.getTotalAmount(), moneyStyle);
                text(row, c++, Boolean.TRUE.equals(order.getIsGift()) ? "Ha" : "");
                text(row, c++, Boolean.TRUE.equals(order.getIsCakeOrder()) ? "Ha" : "");
                text(row, c, order.getComment());
                if (order.getStatus() != OrderStatus.CANCELLED) {
                    sumItems += order.getItemsTotal();
                    sumDiscount += order.getDiscountAmount();
                    sumDelivery += order.getDeliveryFee();
                    sumTotal += order.getTotalAmount();
                }
                rowIndex++;
            }

            // Jami qatori (bekor qilinmaganlar)
            Row totalRow = sheet.createRow(rowIndex);
            Cell label = totalRow.createCell(1);
            label.setCellValue("JAMI (bekor qilinmaganlar)");
            label.setCellStyle(headerStyle);
            money(totalRow, 10, sumItems, boldMoneyStyle);
            money(totalRow, 11, sumDiscount, boldMoneyStyle);
            money(totalRow, 13, sumDelivery, boldMoneyStyle);
            money(totalRow, 14, sumTotal, boldMoneyStyle);

            // Sarlavha qatorini qotirib, filtr tugmalarini qo'yamiz
            sheet.createFreezePane(0, 1);
            sheet.setAutoFilter(new CellRangeAddress(0, 0, 0, HEADERS.length - 1));

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Excel faylni yaratib bo'lmadi", e);
        } finally {
            workbook.dispose();
        }
    }

    /**
     * Matn katagini yozadi. Excel formulaga aylantiradigan bosh belgidan oldin tirnoq qo'yadi.
     *
     * @param row   qator
     * @param col   ustun raqami
     * @param value matn (null bo'lishi mumkin)
     */
    private void text(Row row, int col, String value) {
        row.createCell(col).setCellValue(excelText(value));
    }

    /**
     * =, +, -, @, tab yoki qator qaytishi bilan boshlangan matnni formulaga aylantirmaydi.
     *
     * @param value matn
     * @return Excel uchun xavfsiz matn
     */
    private String excelText(String value) {
        if (value == null || value.isEmpty()) {
            return "";
        }
        char first = value.charAt(0);
        if (first == '=' || first == '+' || first == '-' || first == '@' || first == '\t' || first == '\r') {
            return "'" + value;
        }
        return value;
    }

    private void money(Row row, int col, long value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    /**
     * Yordamchi metod: olib ketishda filial nomi, yetkazishda manzil.
     *
     * @param order buyurtma
     * @return olish joyi yoki manzil matni
     */
    private String place(CustomerOrder order) {
        if (order.getOrderType() == OrderType.PICKUP) {
            return order.getBranch() == null ? "" : order.getBranch().getNameUz();
        }
        return order.getDeliveryAddress() == null ? "" : order.getDeliveryAddress();
    }

    /**
     * Yordamchi metod: buyurtma tarkibini matn qiladi (tort buyurtmasida "Tort buyurtmasi").
     *
     * @param order buyurtma
     * @return tarkib matni (juda uzun bo'lsa qisqartiriladi)
     */
    private String itemsText(CustomerOrder order) {
        if (Boolean.TRUE.equals(order.getIsCakeOrder())) {
            return "Tort buyurtmasi";
        }
        String text = order.getItems().stream()
                .map(item -> describe(item))
                .collect(Collectors.joining("; "));
        return text.length() > MAX_CELL_TEXT ? text.substring(0, MAX_CELL_TEXT) + "..." : text;
    }

    /**
     * Yordamchi metod: bitta mahsulot qatorini matn qiladi (masalan, "Napoleon torti x 2 dona").
     *
     * @param item buyurtmadagi qator
     * @return matn
     */
    private String describe(OrderItem item) {
        return item.getProductNameUz() + " x " + item.getQuantity().stripTrailingZeros().toPlainString()
                + " " + item.getUnitType().label(false);
    }

    /**
     * Yordamchi metod: holatning o'zbekcha nomi.
     *
     * @param status holat
     * @return o'zbekcha nom
     */
    private String statusLabel(OrderStatus status) {
        return switch (status) {
            case NEW -> "Yangi";
            case PRICE_PENDING -> "Narx kutilmoqda";
            case CONFIRMED -> "Qabul qilindi";
            case PREPARING -> "Tayyorlanmoqda";
            case READY -> "Tayyor";
            case DELIVERING -> "Yo'lda";
            case COMPLETED -> "Topshirildi";
            case CANCELLED -> "Bekor qilindi";
        };
    }
}
