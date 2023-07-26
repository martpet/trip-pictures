import { Photo } from '../Photo';

export type GetOnePhotoResponse = Photo;

export type PostPhotosRequest = Omit<Photo, 'userId' | 'createdAt'>[];
export type PostPhotosResponse = Photo[];
