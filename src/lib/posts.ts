import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
}

export function getSortedPostsData(): Omit<Post, "content">[] {
  // 폴더가 없는 경우 빈 배열 반환
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      // date 필드 처리 (Date 객체 -> YYYY-MM-DD 변환)
      let dateStr = "";
      if (data.date instanceof Date) {
        dateStr = data.date.toISOString().split("T")[0];
      } else if (typeof data.date === "string") {
        dateStr = data.date.split("T")[0];
      } else {
        dateStr = String(data.date || "");
      }

      return {
        slug,
        title: data.title || "",
        date: dateStr,
        summary: data.summary || "",
        category: data.category || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
      };
    });

  // 날짜 내림차순 정렬 (최신 순)
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostData(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  let dateStr = "";
  if (data.date instanceof Date) {
    dateStr = data.date.toISOString().split("T")[0];
  } else if (typeof data.date === "string") {
    dateStr = data.date.split("T")[0];
  } else {
    dateStr = String(data.date || "");
  }

  return {
    slug,
    title: data.title || "",
    date: dateStr,
    summary: data.summary || "",
    category: data.category || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    content,
  };
}
