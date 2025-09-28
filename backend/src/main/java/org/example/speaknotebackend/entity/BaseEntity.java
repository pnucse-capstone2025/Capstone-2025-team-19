package org.example.speaknotebackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
public class BaseEntity {

    @CreationTimestamp
    @Column(name = "createdAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    protected Status status = Status.ACTIVE;

    public enum Status {
        ACTIVE,
        INACTIVE;
    }

    public void delete() {
        this.status = Status.INACTIVE;
    }

    public void updateActive() {
        this.status = Status.ACTIVE;
    }

    public void updateInActive() {
        this.status = Status.INACTIVE;
    }
}
