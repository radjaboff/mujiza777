package uz.akmal.mujiza.report.service;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import uz.akmal.mujiza.order.dto.OrderFilter;
import uz.akmal.mujiza.order.entity.CustomerOrder;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.enums.PaymentMethod;
import uz.akmal.mujiza.order.repository.CustomerOrderRepository;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Mijoz maydonlari Excel formulasiga aylanmasligi kerak. Oddiy ism o'zgarmaydi.
 */
class OrderExcelExporterTest {

    @Test
    void prefixesFormulaTextAndLeavesOrdinaryNames() throws Exception {
        CustomerOrderRepository repository = mock(CustomerOrderRepository.class);
        when(repository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(
                        order("=HYPERLINK(\"http://evil\")", "+998901112233"),
                        order("Akmal", "901112233"))));
        byte[] bytes = new OrderExcelExporter(repository).export(new OrderFilter(null, null, null, null, null));

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertThat(workbook.getSheetAt(0).getRow(1).getCell(5).getStringCellValue())
                    .isEqualTo("'=HYPERLINK(\"http://evil\")");
            assertThat(workbook.getSheetAt(0).getRow(1).getCell(6).getStringCellValue())
                    .startsWith("'+");
            assertThat(workbook.getSheetAt(0).getRow(2).getCell(5).getStringCellValue())
                    .isEqualTo("Akmal");
            assertThat(workbook.getSheetAt(0).getRow(1).getCell(1).getStringCellValue())
                    .isEqualTo("MJ-1001");
        }
    }

    private static CustomerOrder order(String name, String phone) {
        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber("MJ-1001");
        order.setCreatedAt(LocalDateTime.of(2026, 11, 6, 12, 0));
        order.setStatus(OrderStatus.NEW);
        order.setOrderType(OrderType.DELIVERY);
        order.setCustomerName(name);
        order.setCustomerPhone(phone);
        order.setDeliveryAddress("Chilonzor");
        order.setPaymentMethod(PaymentMethod.CASH);
        order.setItemsTotal(1000L);
        order.setDiscountAmount(0L);
        order.setDeliveryFee(0L);
        order.setTotalAmount(1000L);
        order.setComment("rahmat");
        return order;
    }
}
