const express = require('express');
const fs = require('fs/promises');
const xml2js = require('xml2js');

const app = express();
const PORT = 3000;

// Асинхронна функція для читання JSON файлу
async function readJSONFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Помилка читання JSON файлу:', error);
    throw error;
  }
}

// Функція для знаходження активу з найменшим значенням
function findMinAsset(assets) {
  if (!assets || !Array.isArray(assets) || assets.length === 0) {
    throw new Error('Не знайдено валідних активів у даних');
  }

  // Відфільтруємо активи з валідними числовими значеннями
  const validAssets = assets.filter(asset => 
    asset.hasOwnProperty('value') && 
    !isNaN(parseFloat(asset.value))
  );

  if (validAssets.length === 0) {
    throw new Error('Не знайдено активів з валідними числовими значеннями');
  }

  // Знаходимо актив з найменшим значенням
  return validAssets.reduce((minAsset, currentAsset) => {
    const currentValue = parseFloat(currentAsset.value);
    const minValue = parseFloat(minAsset.value);
    return currentValue < minValue ? currentAsset : minAsset;
  });
}

// Асинхронна функція для створення XML з активом, що має найменше значення
async function createXMLWithMinAsset(minAsset) {
  return new Promise((resolve, reject) => {
    try {
      const builder = new xml2js.Builder();
      const xmlObj = {
        data: {
          min_value: minAsset.value.toString()
        }
      };
      
      const xmlString = builder.buildObject(xmlObj);
      resolve(xmlString);
    } catch (error) {
      reject(error);
    }
  });
}

// Головний обробник маршруту з використанням async/await
app.get('*', async (req, res) => {
  try {
    // Асинхронно читаємо JSON дані з файлу
    const jsonData = await readJSONFile('./data.json');
    
    // Знаходимо актив з найменшим значенням
    const minAsset = findMinAsset(jsonData);
    
    // Асинхронно створюємо XML відповідь, що містить лише актив з найменшим значенням
    const xmlResponse = await createXMLWithMinAsset(minAsset);
    
    // Відправляємо XML відповідь
    res.setHeader('Content-Type', 'application/xml');
    res.send(xmlResponse);
  } catch (error) {
    console.error('Помилка обробки запиту:', error);
    res.status(500).send(`Помилка: ${error.message}`);
  }
});

// Запускаємо сервер і логуємо, коли він готовий
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});