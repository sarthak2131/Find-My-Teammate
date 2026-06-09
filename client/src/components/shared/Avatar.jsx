import { defaultAvatar } from "../../utils/defaultAvatar";

export default function Avatar({ src, alt, className }) {
  return (
    <img
      src={src || defaultAvatar}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = defaultAvatar;
      }}
    />
  );
}
