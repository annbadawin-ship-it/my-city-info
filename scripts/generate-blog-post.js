const fs = require('fs');
const path = require('path');

async function main() {
  const jsonPath = path.join(__dirname, '..', 'public', 'data', 'city-info.json');
  let originalData = [];
  try {
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    originalData = JSON.parse(fileContent);
  } catch (error) {
    console.error('기존 데이터를 읽는 중 에러 발생:', error.message);
    process.exit(1);
  }

  if (originalData.length === 0) {
    console.log('데이터가 비어 있습니다.');
    process.exit(0);
  }

  // 1단계: 최신 데이터 확인
  const latestItem = originalData[originalData.length - 1];

  const postsDir = path.join(__dirname, '..', 'src', 'content', 'posts');
  let isAlreadyWritten = false;
  try {
    const files = fs.readdirSync(postsDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
        // 서비스 명(name)이 이미 작성된 글 내용에 포함되어 있는지 확인
        if (content.includes(latestItem.name)) {
          isAlreadyWritten = true;
          break;
        }
      }
    }
  } catch (error) {
    console.error('기존 포스트 목록을 읽는 중 에러 발생:', error.message);
    process.exit(1);
  }

  if (isAlreadyWritten) {
    console.log('이미 작성된 글입니다');
    process.exit(0);
  }

  // 2단계: Gemini AI로 블로그 글 생성
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];
  const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem, null, 2)}

## 아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:

---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: ${today}-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

  let responseText = '';
  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API 응답 상태 에러: ${response.status}`);
    }

    const result = await response.json();
    responseText = result.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini 글 생성 중 에러 발생:', error.message);
    process.exit(1);
  }

  // 3단계: 파일 저장
  // Gemini 응답에서 FILENAME 부분 분리
  const lines = responseText.split('\n');
  let filename = `${today}-post.md`;
  let cleanLines = [];

  for (let line of lines) {
    if (line.toUpperCase().includes('FILENAME:')) {
      const match = line.match(/FILENAME:\s*([^\s]+)/i);
      if (match && match[1]) {
        filename = match[1].trim();
        if (!filename.endsWith('.md')) {
          filename += '.md';
        }
      }
    } else {
      cleanLines.push(line);
    }
  }

  // 앞뒤 빈 줄 및 마크다운 코드 블럭 표시 제거
  let fileContent = cleanLines.join('\n').trim();
  if (fileContent.startsWith('```markdown')) {
    fileContent = fileContent.replace(/^```markdown\s*/i, '').replace(/```$/, '').trim();
  } else if (fileContent.startsWith('```')) {
    fileContent = fileContent.replace(/^```\s*/, '').replace(/```$/, '').trim();
  }

  const outputPath = path.join(postsDir, filename);
  try {
    fs.writeFileSync(outputPath, fileContent, 'utf8');
    console.log(`블로그 글이 성공적으로 생성되었습니다: ${filename}`);
  } catch (error) {
    console.error('파일 저장 중 에러 발생:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('알 수 없는 시스템 에러:', error.message);
  process.exit(1);
});
