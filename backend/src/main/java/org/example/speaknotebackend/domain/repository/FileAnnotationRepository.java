package org.example.speaknotebackend.domain.repository;

import org.bson.types.ObjectId;
import org.example.speaknotebackend.mongo.annotation.FileAnnotationDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FileAnnotationRepository
        extends MongoRepository<FileAnnotationDoc, ObjectId> {

    Optional<FileAnnotationDoc> findFirstByFileIdOrderByVersionDesc(Long fileId);

    Optional<FileAnnotationDoc> findByFileIdAndVersion(Long fileId, Integer version);

    Optional<FileAnnotationDoc> findFirstByFileIdAndUserIdOrderByVersionDesc(Long fileId, Long userId);


    Optional<FileAnnotationDoc> findTopByFileIdAndUserIdOrderByVersionDesc(Long fileId, Long userId);

    Optional<FileAnnotationDoc> findByFileIdAndUserIdAndVersion(Long fileId, Long userId, Integer version);

    List<FileAnnotationDoc> findByFileIdAndUserIdOrderByVersionDesc(Long fileId, Long userId);

    long countByFileId(Long fileId);
}
