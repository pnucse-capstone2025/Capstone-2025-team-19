from speak_note.manager.manager import Manager
from speak_note.instance.user import User

class UserManager(Manager):
    def __init__(self):
        super().__init__()

    def create_user(self, user_id=None):
        user = User()  # 여기서 Instance.__init__ 호출 → uuid 부여
        if user_id is not None:   # 서버에서 user_id를 넘겨줬으면 덮어씌움
            user.id = user_id
        self.create_instance(user)
        return user

    # 필요한 경우 유저 특화 메서드 추가
