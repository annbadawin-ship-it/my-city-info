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

  const apiKey = process.env.PUBLIC_DATA_API_KEY;
  if (!apiKey) {
    console.error('PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  // 1단계: 공공데이터포털 API에서 데이터 가져오기
  const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON`;
  let services = [];
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Infuser ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`API 응답 상태 에러: ${response.status}`);
    }

    const result = await response.json();
    services = result.data || [];
  } catch (error) {
    console.error('공공데이터 API 호출 중 에러 발생:', error.message);
    process.exit(1);
  }

  if (!services || services.length === 0) {
    console.log('가져온 공공데이터가 없습니다.');
    process.exit(0);
  }

  const hasKeyword = (item, keyword) => {
    const fields = ['서비스명', '서비스목적요약', '지원대상', '소관기관명', 'serviceNm', 'servicePurpsSummary', 'supportTarget', 'orgNm'];
    return fields.some(field => {
      const val = item[field];
      return val && typeof val === 'string' && val.includes(keyword);
    });
  };

  // 필터링 규칙 적용
  let filteredServices = services.filter(item => hasKeyword(item, '성남'));
  if (filteredServices.length === 0) {
    filteredServices = services.filter(item => hasKeyword(item, '경기'));
  }
  if (filteredServices.length === 0) {
    filteredServices = services;
  }

  // 2단계: 기존 데이터와 비교 (name 기준 중복 확인)
  const existingNames = new Set(originalData.map(item => item.name));
  const newServices = filteredServices.filter(item => {
    const name = item['서비스명'] || item['serviceNm'] || '';
    return name && !existingNames.has(name);
  });

  if (newServices.length === 0) {
    console.log('새로운 데이터가 없습니다');
    process.exit(0);
  }

  // 새 항목 1개 선정
  const targetService = newServices[0];

  // 3단계: Gemini AI로 새 항목 1개만 가공
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];
  const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터:
${JSON.stringify(targetService, null, 2)}`;

  let processedItem = null;
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
    let text = result.candidates[0].content.parts[0].text;
    
    // 마크다운 코드 블록 제거
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }

    processedItem = JSON.parse(cleanText);
  } catch (error) {
    console.error('Gemini 가공 중 에러 발생:', error.message);
    process.exit(1);
  }

  if (!processedItem) {
    console.error('가공된 데이터가 올바르지 않습니다.');
    process.exit(1);
  }

  // ID를 고유하게 재부여 (사용자가 id 형식을 프롬프트에서 숫자로 지정했으므로, 기존 id들과의 중복을 피하기 위해 처리하거나 그대로 둠)
  // 기존 json에는 event-1, benefit-1 등이 있지만, gemini 프롬프트가 {id: 숫자} 였으므로 숫자로 들어옵니다.
  // 기존 숫자 id 최대값 계산
  let maxNumId = 0;
  originalData.forEach(item => {
    const num = parseInt(item.id);
    if (!isNaN(num) && num > maxNumId) {
      maxNumId = num;
    } else if (typeof item.id === 'string') {
      const match = item.id.match(/\d+/);
      if (match) {
        const parsed = parseInt(match[0]);
        if (parsed > maxNumId) {
          maxNumId = parsed;
        }
      }
    }
  });
  processedItem.id = maxNumId + 1;

  // 4단계: 기존 데이터에 추가
  originalData.push(processedItem);

  try {
    fs.writeFileSync(jsonPath, JSON.stringify(originalData, null, 2), 'utf8');
    console.log('데이터가 성공적으로 추가되었습니다:', processedItem.name);
  } catch (error) {
    console.error('결과 데이터를 저장하는 중 에러 발생:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('알 수 없는 시스템 에러:', error.message);
  process.exit(1);
});
