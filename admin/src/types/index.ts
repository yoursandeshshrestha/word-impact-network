// This file should be placed in src/types/index.ts or another appropriate location

/**
 * Type utility for Next.js App Router page components affected by middleware
 * that wraps params in Promises
 */

/**
 * Generic type for page parameters in routes with dynamic segments
 * e.g., /courses/[id]/chapters/[chapterId]/exam/[examId]
 */
export type RouteParams<T> = Promise<T>;

/**
 * Generic type for search parameters
 */
export type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

/**
 * Generic Page Props interface for protected routes
 * where params are wrapped in Promises by middleware
 */
export interface ProtectedPageProps<T> {
  params: RouteParams<T>;
  searchParams: SearchParams;
}

/**
 * Helper type for exam page params
 */
export type ExamPageParams = {
  id: string; // courseId
  chapterId: string;
  examId: string;
};

/**
 * Helper type for chapter page params
 */
export type ChapterPageParams = {
  id: string; // courseId
  chapterId: string;
};

/**
 * Helper type for course page params
 */
export type CoursePageParams = {
  id: string; // courseId
};

/**
 * Example usage:
 *
 * import { ProtectedPageProps, ExamPageParams } from '@/types';
 *
 * export default function ExamPage({ params, searchParams }: ProtectedPageProps<ExamPageParams>) {
 *   const [resolvedParams, setResolvedParams] = useState<ExamPageParams | null>(null);
 *
 *   useEffect(() => {
 *     params.then(setResolvedParams);
 *   }, [params]);
 *
 *   // Rest of component...
 * }
 */

/**
 * Socket Events
 */
export enum SocketEvents {
  CONNECTION = 'connection',
  CONNECTED = 'connected',
  NEW_MESSAGE = 'new_message',
  MESSAGE_READ = 'message_read',
  DISCONNECT = 'disconnect',
  ANNOUNCEMENT = 'announcement',
  NOTIFICATION = 'notification',
  NOTIFICATION_READ = 'notification_read',
  NOTIFICATION_READ_ALL = 'notification_read_all',
  VIDEO_STATUS_UPDATE = 'video_status_update',
  VIDEO_PROCESSING_PROGRESS = 'video_processing_progress',
}
