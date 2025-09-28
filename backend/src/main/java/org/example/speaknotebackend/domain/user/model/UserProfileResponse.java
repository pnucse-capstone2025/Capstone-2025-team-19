package org.example.speaknotebackend.domain.user.model;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class UserProfileResponse {

    private Long id;

    private String email;

    private String name;
}
