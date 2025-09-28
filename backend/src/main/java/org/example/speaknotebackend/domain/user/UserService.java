package org.example.speaknotebackend.domain.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.speaknotebackend.common.exceptions.BaseException;
import org.example.speaknotebackend.domain.repository.FolderRepository;
import org.example.speaknotebackend.domain.repository.UserRepository;
import org.example.speaknotebackend.entity.BaseEntity;
import org.example.speaknotebackend.entity.Folder;
import org.example.speaknotebackend.entity.SocialType;
import org.example.speaknotebackend.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static org.example.speaknotebackend.common.response.BaseResponseStatus.USER_NOT_FOUND;

@RequiredArgsConstructor
@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final FolderRepository folderRepository;

    public User findByEmailAndSocialId(String email, String socialId) {
        return userRepository
                .findByEmailAndStatusAndSocialId(email, BaseEntity.Status.ACTIVE, socialId)
                .orElseThrow(() -> new BaseException(USER_NOT_FOUND));
    }

    public User findActiveById(Long userId) {
        return userRepository
                .findByIdAndStatus(userId, BaseEntity.Status.ACTIVE)
                .orElseThrow(() -> new BaseException(USER_NOT_FOUND));
    }

    @Transactional
    public User createUser(String email, String name, String socialId, SocialType socialType) {
        User user = User.builder()
                .email(email)
                .name(name)
                .password("") // 소셜 로그인은 패스워드가 없음
                .socialId(socialId)
                .socialType(socialType)
                .build();

        User saved = userRepository.save(user);

        // 회원가입 시, 자동으로 "기본" 폴더 생성
        folderRepository.save(Folder.builder()
                .user(saved)
                .name("기본")
                .basic(true)
                .build());

        return saved;
    }
}
