import React, { useState } from "react";
import { Chapter } from "@/redux/features/chaptersSlice";
import ChapterCard from "./ChapterCard";
import NoDataFound from "../common/NoDataFound";
import Pagination from "../common/Pagination";
import { BookOpen } from "lucide-react";

interface ChapterListProps {
  chapters: Chapter[];
  courseId: string;
  onEdit: (chapter: Chapter) => void;
  onDelete: (id: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  courseId,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 chapters per page

  // Group chapters by year
  const chaptersByYear: { [key: number]: Chapter[] } = {};

  chapters.forEach((chapter) => {
    if (!chaptersByYear[chapter.courseYear]) {
      chaptersByYear[chapter.courseYear] = [];
    }
    chaptersByYear[chapter.courseYear].push(chapter);
  });

  // Sort chapters by orderIndex within each year
  Object.keys(chaptersByYear).forEach((year) => {
    chaptersByYear[Number(year)].sort((a, b) => a.orderIndex - b.orderIndex);
  });

  // Get sorted years (numerically)
  const years = Object.keys(chaptersByYear)
    .map(Number)
    .sort((a, b) => a - b);

  // Pagination logic
  const totalItems = chapters.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Visually slice chapters for current page (but maintain year grouping)
  let itemsShown = 0;
  const shownYears: number[] = [];

  for (const year of years) {
    const chaptersInYear = chaptersByYear[year].length;

    if (itemsShown < startIndex && itemsShown + chaptersInYear <= startIndex) {
      // Skip this year completely (all chapters are before currentPage)
      itemsShown += chaptersInYear;
    } else if (
      itemsShown + chaptersInYear > startIndex &&
      itemsShown < endIndex
    ) {
      // Show some or all chapters from this year
      shownYears.push(year);
      itemsShown += chaptersInYear;
    } else if (itemsShown >= endIndex) {
      // Stop showing years once we've reached the limit
      break;
    }
  }

  if (chapters.length === 0) {
    return (
      <NoDataFound message="No chapters found. Create your first chapter to get started." />
    );
  }

  return (
    <div className="space-y-8">
      {shownYears.map((year) => (
        <div key={year} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen size={18} className="mr-2 text-indigo-600" />
            Year {year}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chaptersByYear[year].map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                courseId={courseId}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ChapterList;
