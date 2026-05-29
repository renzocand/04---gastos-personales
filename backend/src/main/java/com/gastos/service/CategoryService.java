package com.gastos.service;

import java.util.List;

import com.gastos.dto.CategoryResponse;
import com.gastos.mapper.ExpenseMapper;
import com.gastos.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ExpenseMapper mapper;

    public CategoryService(CategoryRepository categoryRepository, ExpenseMapper mapper) {
        this.categoryRepository = categoryRepository;
        this.mapper = mapper;
    }

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }
}
