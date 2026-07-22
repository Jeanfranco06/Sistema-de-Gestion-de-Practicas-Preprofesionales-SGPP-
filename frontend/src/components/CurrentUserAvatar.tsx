import { useEffect, useState } from 'react';
import { Avatar, type AvatarProps } from '@/ui';
import { useFotoPerfil } from '@/hooks/useUsuarios';

interface CurrentUserAvatarProps extends Omit<AvatarProps, 'src' | 'fallback'> {
  userId?: number;
  fallback: string;
}

export function CurrentUserAvatar({ userId, fallback, ...props }: CurrentUserAvatarProps) {
  const { data: photo } = useFotoPerfil(userId);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!photo) {
      setPhotoUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  return <Avatar {...props} src={photoUrl} fallback={fallback} />;
}
