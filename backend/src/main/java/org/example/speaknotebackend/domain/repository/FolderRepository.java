package org.example.speaknotebackend.domain.repository;

import org.example.speaknotebackend.entity.BaseEntity;
import org.example.speaknotebackend.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByUserIdAndStatus(Long userId, BaseEntity.Status status);

    Optional<Folder> findByUserIdAndIdAndStatus(Long userId, Long folderId, BaseEntity.Status status);
  
    Folder findFirstByUserIdAndBasic(Long userId,Boolean True);

}