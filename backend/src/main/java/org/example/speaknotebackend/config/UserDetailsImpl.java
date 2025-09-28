package org.example.speaknotebackend.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * 요청 처리 동안 SecurityContext에 보관될 사용자 정보.
 * 가벼운 필드(userId, email, name, authorities)만 보관합니다.
 */
public class UserDetailsImpl implements UserDetails {

    private final Long userId;
    private final String email;
    private final String name;
    private final List<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long userId, String email, String name,
                           List<? extends GrantedAuthority> authorities ) {
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.authorities = authorities;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null; // JWT 기반으로 비밀번호는 보관하지 않음
    }

    @Override
    public String getUsername() {
        // 스프링 시큐리티 표준 username은 email로 매핑
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}


