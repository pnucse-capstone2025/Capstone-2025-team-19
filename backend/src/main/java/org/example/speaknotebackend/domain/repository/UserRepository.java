package org.example.speaknotebackend.domain.repository;

import org.example.speaknotebackend.entity.BaseEntity;
import org.example.speaknotebackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndStatusAndSocialId(String email, BaseEntity.Status status, String socialId);

    Optional<User> findByIdAndStatus(Long id, BaseEntity.Status status);
}
