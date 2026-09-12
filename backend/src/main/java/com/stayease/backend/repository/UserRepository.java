package com.stayease.backend.repository;
import com.stayease.backend.enums.Role;
import com.stayease.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface UserRepository extends MongoRepository<User, String>{
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    Page<User> findByRole(
            Role role,
            Pageable pageable
    );
}