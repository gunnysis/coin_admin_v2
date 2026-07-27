/// <reference types="nativewind/types" />

// TS 6.0의 TS2882(사이드이펙트 import 선언 검사) 대응 — global.css 등 CSS 번들 import용
declare module "*.css";
