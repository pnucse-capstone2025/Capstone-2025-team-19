package org.example.speaknotebackend.domain.folder;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.common.exceptions.BaseException;
import org.example.speaknotebackend.common.response.BaseResponseStatus;
import org.example.speaknotebackend.domain.folder.model.CreateFolderRequest;
import org.example.speaknotebackend.domain.folder.model.GetFolderListResponse;
import org.example.speaknotebackend.domain.repository.FolderRepository;
import org.example.speaknotebackend.domain.repository.LectureHistoryCustom;
import org.example.speaknotebackend.domain.repository.LectureHistoryCustomImpl;
import org.example.speaknotebackend.domain.repository.LectureRepository;
import org.example.speaknotebackend.domain.user.UserService;
import org.example.speaknotebackend.entity.BaseEntity;
import org.example.speaknotebackend.entity.Folder;
import org.example.speaknotebackend.entity.Lecture;
import org.example.speaknotebackend.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class FolderService {

    private final FolderRepository folderRepository;
    private final UserService userService;

    @Transactional
    public Folder createFolder(Long userId, CreateFolderRequest request) {
        User owner = userService.findActiveById(userId);

        Folder folder = Folder.builder()
                .user(owner)
                .name(request.getFolderName())
                .build();

        Folder saved = folderRepository.save(folder);
        return saved;
    }

    public List<GetFolderListResponse> getFolderList(Long userId) {
        List<Folder> folders = folderRepository.findByUserIdAndStatus(userId, BaseEntity.Status.ACTIVE);

        return folders.stream()
                .map(folder -> GetFolderListResponse.builder()
                        .folderId(folder.getId())
                        .name(folder.getName())
                        .build())
                .toList();
    }

    @Transactional
    public void updateFolder(Long userId, Long folderId, String folderName) {
        Folder folder = folderRepository.findByUserIdAndIdAndStatus(userId, folderId, BaseEntity.Status.ACTIVE)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.FOLDER_NOT_FOUND));

        if (folderName.equals(folder.getName())) {
            return;
        }

        folder.setName(folderName); // TODO : 중복 폴더명 방지 로직 추가
    }

    @Transactional
    public void deleteFolder(Long userId, Long folderId) {
        Folder folder = folderRepository.findByUserIdAndIdAndStatus(userId, folderId, BaseEntity.Status.ACTIVE)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.FOLDER_NOT_FOUND));

        // TODO : 연관된 note 삭제 로직 추가

        folder.delete(); // soft delete
    }

    @Transactional
    public void moveFolder(Long userId,Long lectureId, Long newFolderId) {
        Folder folder = folderRepository.findById(newFolderId)
                .orElseThrow(()-> new BaseException(BaseResponseStatus.FOLDER_NOT_FOUND ));
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(()-> new BaseException(BaseResponseStatus.LECTURE_NOT_FOUND ));
        lecture.setFolder(folder);

    }

    private final LectureRepository lectureRepository;
}
