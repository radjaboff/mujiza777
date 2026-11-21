package uz.akmal.mujiza.shop.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;
import uz.akmal.mujiza.config.CacheConfig;
import uz.akmal.mujiza.shop.dto.BranchRequest;
import uz.akmal.mujiza.shop.dto.BranchResponse;
import uz.akmal.mujiza.shop.dto.PublicBranchResponse;
import uz.akmal.mujiza.shop.entity.Branch;
import uz.akmal.mujiza.shop.mapper.BranchMapper;
import uz.akmal.mujiza.shop.repository.BranchRepository;
import uz.akmal.mujiza.shop.service.BranchService;

import java.util.List;

/**
 * Filiallar bilan ishlash qoidalarining amaldagi ijrosi.
 *
 * @Service: Spring bu klassni "biznes mantiq qatlami" sifatida taniydi.
 * @RequiredArgsConstructor (Lombok): final maydonlar uchun konstruktor yaratadi.
 * @Slf4j (Lombok): log yozish uchun "log" o'zgaruvchisini yaratadi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {

    /**
     * Bazadan filiallarni o'qish va yozish uchun.
     */
    private final BranchRepository branchRepository;

    /**
     * Entity va DTO'ni bir-biriga aylantirish uchun.
     */
    private final BranchMapper branchMapper;

    /**
     * {@inheritDoc}
     * readOnly = true: faqat o'qiladi, baza tezroq ishlaydi.
     */
    @Override
    @Transactional(readOnly = true)
    public List<BranchResponse> getAll() {
        return branchRepository.findAllByIsDeletedFalseOrderBySortOrderAsc()
                .stream()
                .map(branchMapper::toResponse)
                .toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public BranchResponse getById(Long id) {
        return branchMapper.toResponse(findActiveOrThrow(id));
    }

    /**
     * {@inheritDoc}
     * @Transactional: ichidagi barcha ishlar bitta tranzaksiya, xato bo'lsa hammasi bekor qilinadi.
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.BRANCHES, allEntries = true)
    public BranchResponse create(BranchRequest request) {
        // Kenglik va uzunlik juft bo'lishi kerak
        validateCoordinates(request);
        Branch saved = branchRepository.save(branchMapper.toEntity(request));
        log.info("Filial yaratildi: id={}", saved.getId());
        return branchMapper.toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.BRANCHES, allEntries = true)
    public BranchResponse update(Long id, BranchRequest request) {
        validateCoordinates(request);
        // Tahrirlanadigan filialni topamiz (topilmasa 404)
        Branch branch = findActiveOrThrow(id);
        branchMapper.applyRequest(branch, request);
        Branch saved = branchRepository.save(branch);
        log.info("Filial yangilandi: id={}", saved.getId());
        return branchMapper.toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.BRANCHES, allEntries = true)
    public void delete(Long id) {
        Branch branch = findActiveOrThrow(id);
        // Bazadan o'chirmaymiz, faqat o'chirilgan deb belgilaymiz (soft delete)
        branch.setIsDeleted(true);
        branchRepository.save(branch);
        log.info("Filial o'chirildi (soft delete): id={}", id);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheConfig.BRANCHES, key = "'ru'.equalsIgnoreCase(#lang) ? 'ru' : 'uz'")
    public List<PublicBranchResponse> getPublicAll(String lang) {
        return branchRepository.findAllByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(branch -> branchMapper.toPublicResponse(branch, lang))
                .toList();
    }

    /**
     * Yordamchi metod: id bo'yicha o'chirilmagan filialni topadi yoki 404 xatosini tashlaydi.
     *
     * @param id filialning raqami
     * @return topilgan filial
     */
    private Branch findActiveOrThrow(Long id) {
        return branchRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filial", id));
    }

    /**
     * Yordamchi metod: kenglik va uzunlik birga berilishi yoki ikkalasi ham bo'sh bo'lishi kerak.
     * Faqat bittasi berilsa, xaritada joyni aniqlab bo'lmaydi.
     *
     * @param request admin yuborgan ma'lumot
     */
    private void validateCoordinates(BranchRequest request) {
        boolean hasLatitude = request.latitude() != null;
        boolean hasLongitude = request.longitude() != null;
        if (hasLatitude != hasLongitude) {
            throw new BusinessException("Kenglik va uzunlik birga kiritilishi kerak");
        }
    }
}