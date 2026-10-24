import "./Avatar.css";

type AvatarProps = {
  name: string;
  photoUrl?: string;
  size?: number;
};

function Avatar({ name, photoUrl }: AvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="avatar">
      {photoUrl ? (
        <img src={photoUrl} alt={`Foto de ${name}`} />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

export default Avatar;
