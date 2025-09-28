// components/AutoPlayVideo.tsx

export default function AutoPlayVideo() {
    return (
      <div className=" flex justify-center py-10">
<video
  autoPlay
  muted
  loop
  playsInline
  className=" max-w-[1500px] h-[400px] object-cover rounded-xl "
>

          <source src="/video/landing.mp4" type="video/mp4" />
          브라우저가 video 태그를 지원하지 않습니다.
        </video>
      </div>
    );
  }