package uz.akmal.mujiza.shop.dto;

/**
 * Mijoz saytiga qaytariladigan filial ma'lumoti: nom va manzil so'ralgan tilda.
 *
 * @param id                filialning noyob raqami
 * @param name              nomi so'ralgan tilda
 * @param address           manzil so'ralgan tilda
 * @param phone             telefon raqami
 * @param workHours         ish vaqti
 * @param latitude          xaritadagi kenglik
 * @param longitude         xaritadagi uzunlik
 * @param imageUrl          rasm manzili
 * @param isPickupAvailable olib ketish mumkinmi (buyurtmada filial tanlashda kerak)
 */
public record PublicBranchResponse(
        Long id,
        String name,
        String address,
        String phone,
        String workHours,
        Double latitude,
        Double longitude,
        String imageUrl,
        Boolean isPickupAvailable
) {
}