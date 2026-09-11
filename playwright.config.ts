import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',fullyParallel:false,workers:1,retries:0,timeout:45000,use:{baseURL:process.env.BASE_URL||'http://127.0.0.1:3000',headless:true,viewport:{width:1366,height:768},screenshot:'only-on-failure'},reporter:'list'});
