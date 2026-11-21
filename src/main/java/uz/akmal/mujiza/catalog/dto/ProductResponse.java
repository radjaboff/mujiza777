package uz.akmal.mujiza.catalog.dto;

import uz.akmal.mujiza.catalog.enums.Allergen;
import uz.akmal.mujiza.catalog.enums.DietTag;
import uz.akmal.mujiza.catalog.enums.UnitType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Admin panelga qaytariladigan mahsulotning to'liq ma'lumoti.
 * Ikkala tildagi maydonlar ham bor, chunki admin ikkalasini ko'rishi va tahrirlashi kerak.
 *
 * @param id              mahsulotning noyob raqami
 * @param categoryId      kategoriyaning raqami
 * @param categoryNameUz  kategoriyaning o'zbekcha nomi (ro'yxatda ko'rsatish uchun)
 * @param nameUz          nomi o'zbek tilida
 * @param nameRu          nomi rus tilida
 * @param slug            URL uchun qisqa nom
 * @param descriptionUz   tavsif o'zbek tilida
 * @param descriptionRu   tavsif rus tilida
 * @param price           bazada saqlangan narx
 * @param oldPrice        chegirmadan oldingi narx
 * @param discountEndsAt  chegirma tugash vaqti
 * @param weightLabel     vazn yoki o'lcham yozuvi
 * @param imageUrl        asosiy rasm manzili
 * @param imageUrls       qo'shimcha rasmlar manzillari (tartib bo'yicha)
 * @param ingredientsUz   tarkib o'zbek tilida
 * @param ingredientsRu   tarkib rus tilida
 * @param calories        kaloriya, 100 grammga
 * @param shelfLifeHours  saqlash muddati, soatlarda
 * @param prepTimeMinutes tayyorlanish vaqti, daqiqalarda
 * @param isAvailable     sotuvda bormi
 * @param isPopular       "Mashhur" blokida ko'rsatiladimi
 * @param isNew           "Yangi" blokida ko'rsatiladimi
 * @param sortOrder       katalogda ko'rsatish tartibi
 * @param allergens       allergenlar to'plami
 * @param dietTags        parhez belgilari to'plami
 * @param createdAt       yaratilgan vaqt
 * @param updatedAt       oxirgi o'zgartirilgan vaqt
 * @param unitType     sotish birligi (PIECE yoki KG); narx shu birlik uchun
 * @param minQuantity  eng kam buyurtma miqdori
 * @param quantityStep miqdor qadami
 */
public record ProductResponse(
        Long id,
        Long categoryId,
        String categoryNameUz,
        String nameUz,
        String nameRu,
        String slug,
        String descriptionUz,
        String descriptionRu,
        Long price,
        Long oldPrice,
        LocalDateTime discountEndsAt,
        String weightLabel,
        String imageUrl,
        List<String> imageUrls,
        String ingredientsUz,
        String ingredientsRu,
        Integer calories,
        Integer shelfLifeHours,
        Integer prepTimeMinutes,
        Boolean isAvailable,
        Boolean isPopular,
        Boolean isNew,
        Integer sortOrder,
        Set<Allergen> allergens,
        Set<DietTag> dietTags,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
        ,
        UnitType unitType,
        BigDecimal minQuantity,
        BigDecimal quantityStep
) {
}