import { AppRunner } from './components/AppRunner.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        new AppRunner().init();
    } catch (err) {
        console.error('App initialization error:', err);
    }
});

