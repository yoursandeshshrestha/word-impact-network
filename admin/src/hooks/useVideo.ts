import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  addVideo,
  getVideosByChapter,
  getVideoById,
  updateVideo,
  deleteVideo,
  resetVideoStatus,
  setVideo,
  clearVideos,
  selectVideos,
  selectVideo,
  selectVideosLoading,
  selectVideosError,
  selectVideosSuccess,
  selectVideosMessage,
  selectUploadProgress,
  selectIsUploading,
  Video,
} from "@/redux/features/videosSlice";

export const useVideo = () => {
  const dispatch = useDispatch<AppDispatch>();
  const videos = useSelector(selectVideos);
  const video = useSelector(selectVideo);
  const loading = useSelector(selectVideosLoading);
  const error = useSelector(selectVideosError);
  const success = useSelector(selectVideosSuccess);
  const message = useSelector(selectVideosMessage);
  const uploadProgress = useSelector(selectUploadProgress);
  const isUploading = useSelector(selectIsUploading);

  // Reset status when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      dispatch(resetVideoStatus());
    };
  }, [dispatch]);

  const fetchVideosByChapter = (chapterId: string) => {
    dispatch(getVideosByChapter(chapterId));
  };

  const fetchVideoById = (id: string) => {
    dispatch(getVideoById(id));
  };

  const uploadVideo = (chapterId: string, videoData: FormData) => {
    dispatch(addVideo({ chapterId, videoData }));
  };

  const editVideo = (id: string, videoData: FormData | Partial<Video>) => {
    dispatch(updateVideo({ id, videoData }));
  };

  const removeVideo = (id: string) => {
    dispatch(deleteVideo(id));
  };

  const selectVideoData = (videoData: Video | null) => {
    dispatch(setVideo(videoData));
  };

  const reset = () => {
    dispatch(resetVideoStatus());
  };

  const clearVideosList = () => {
    dispatch(clearVideos());
  };

  return {
    videos,
    video,
    loading,
    error,
    success,
    message,
    uploadProgress,
    isUploading,
    fetchVideosByChapter,
    fetchVideoById,
    uploadVideo,
    editVideo,
    removeVideo,
    selectVideo: selectVideoData,
    reset,
    clearVideosList,
  };
};
