// Импорт необходимых классов из библиотеки PixiJS
import { Application, Sprite, Assets } from 'pixi.js';
import { addBackground } from './addBackground';

// Создание нового экземпляра PixiJS приложения
const app = new Application();

async function setup()
{
    // Инициализация приложения с синим фоном и изменением размера под окно
    await app.init({ background: '#1099bb', resizeTo: window });

    // Добавление представления приложения (canvas) в DOM body
    document.body.appendChild(app.canvas);
}

async function preload()
{
    // Create an array of asset data to load.
    const assets = [
        { alias: 'background', src: 'fon.png' },
    ];

    // Load the assets defined above.
    await Assets.load(assets);
}

// Функция для генерации случайного целого числа в заданном диапазоне
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // Генерация случайного целого числа между min и max включительно
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Асинхронная функция для создания спрайта с заданным текстурой и добавления его на сцену приложения
async function createSprite(texturePath, divisionSize, app) {
  const texture = await Assets.load(texturePath); // Асинхронная загрузка текстуры
  const sprite = new Sprite(texture); // Создание нового спрайта с загруженной текстурой
  app.stage.addChild(sprite); // Добавление спрайта на сцену приложения

  // Случайное деление размера спрайта в заданном диапазоне
  const division_size = getRandomInt(divisionSize[0], divisionSize[1]);
  sprite.width = sprite.width / division_size;
  sprite.height = sprite.height / division_size;

  // Установка "якоря" спрайта в центр
  sprite.anchor.set(0.5);

  // Случайная позиция спрайта в пределах границ экрана
  sprite.x = getRandomInt(0, app.screen.width);
  sprite.y = getRandomInt(0, app.screen.height);

  sprite.vx = 0; // Скорость по оси x
  sprite.vy = 0; // Скорость по оси y

  return sprite; // Возврат созданного спрайта
}

// Асинхронная функция для создания спрайта с кастомным курсором
async function createCustomCursor(texturePath, app) {
    const texture = await Assets.load(texturePath); // Асинхронная загрузка текстуры
    const cursor = new Sprite(texture); // Создание нового спрайта с загруженной текстурой
    app.stage.addChild(cursor); // Добавление спрайта на сцену приложения

    //на сколько делить картинку курсора
    const division_size = 2;
    cursor.width = cursor.width / division_size;
    cursor.height = cursor.height / division_size;
    cursor.anchor.set(0.5); // Установка "якоря" спрайта в центр
    return cursor; // Возврат созданного спрайта
  }

// Асинхронный IIFE для инициализации приложения и создания спрайтов
(async () => {
  await setup();
  await preload();

  addBackground(app);

  // Создание 5 кроликов
  const bunnies = [];
  for (let i = 0; i < 5; i++) {
    const bunny = await createSprite('oguzok.png', [1, 3], app); // Создание спрайта кролика
    bunnies.push(bunny); // Добавление кролика в массив кроликов
  }

  // Создание 5 кошек
  const cats = [];
  for (let i = 0; i < 5; i++) {
    const cat = await createSprite('shef.png', [1, 4], app); // Создание спрайта кошки
    cats.push(cat); // Добавление кошки в массив кошек
  }

  // Создание кастомного курсора
  const customCursor = await createCustomCursor('cursor.png', app);
    
  // Функция для перемещения спрайтов от курсора (
  // distance - Фиксированная дистанция, на которую спрайты будут отступать от курсора,
  // stopDistance - Расстояние, при котором спрайт останавливается)
  function moveSprites(sprites, event, acceleration, deceleration, maxSpeed, stopDistance) {
    sprites.forEach(sprite => {
      // Вычисление расстояния от спрайта до курсора
      const dx = event.clientX - sprite.x;
      const dy = event.clientY - sprite.y;
      const distanceToCursor = Math.sqrt(dx * dx + dy * dy);
  
      // Если расстояние до курсора меньше stopDistance, спрайт движется к курсору
      if (distanceToCursor < stopDistance) {
        // Вычисление вектора направления от курсора к спрайту
        const normalizedDx = dx / distanceToCursor;
        const normalizedDy = dy / distanceToCursor;
  
        // Ускорение спрайта
        sprite.vx += normalizedDx * acceleration;
        sprite.vy += normalizedDy * acceleration;
  
        // Ограничение скорости спрайта
        const speed = Math.sqrt(sprite.vx * sprite.vx + sprite.vy * sprite.vy);
        if (speed > maxSpeed) {
          const factor = maxSpeed / speed;
          sprite.vx *= factor;
          sprite.vy *= factor;
        }
      } else {
        // Плавное торможение спрайта
        sprite.vx *= deceleration;
        sprite.vy *= deceleration;
      }
  
      // Обновление позиции спрайта
      if (!sprite.isWrapping) {
        sprite.x -= sprite.vx; // Вычитаем скорость, чтобы двигаться от курсора
        sprite.y -= sprite.vy; // Вычитаем скорость, чтобы двигаться от курсора
      }
  
      // Обработка выхода за пределы поля
        if (sprite.x < 0 || sprite.x > app.screen.width || sprite.y < 0 || sprite.y > app.screen.height) {
            if (!sprite.isWrapping) {
                sprite.isWrapping = true;
                if (sprite.x < 0) sprite.x = app.screen.width;
                if (sprite.x > app.screen.width) sprite.x = 0;
                if (sprite.y < 0) sprite.y = app.screen.height;
                if (sprite.y > app.screen.height) sprite.y = 0;
                setTimeout(() => { sprite.isWrapping = false; }, 6000);
            }
        } else {
            sprite.isWrapping = false;
        }

    });
  }
  
  // Обработчик события перемещения мыши
  function onMouseMove(event) {
    // Обновление позиции кастомного курсора в соответствии с движением мыши
    customCursor.x = event.clientX;
    customCursor.y = event.clientY;
  }

  // Функция для обновления положения спрайтов постоянно
  function updateSpritesPosition() {
    moveSprites(bunnies, { clientX: customCursor.x, clientY: customCursor.y }, 1, 0.99, 10, 300); // Перемещение кроликов от курсора
    moveSprites(cats, { clientX: customCursor.x, clientY: customCursor.y }, 4, 0.99, 10, 300); // Перемещение котов от курсора
  }

  // Установка интервала для вызова функции обновления положения спрайтов
  setInterval(updateSpritesPosition, 1000/144); // сек/фпс

  // Добавление обработчика события перемещения мыши к окну
  window.addEventListener('mousemove', onMouseMove);
  // Скрытие стандартного курсора браузера
  document.body.style.cursor = 'none';
})();