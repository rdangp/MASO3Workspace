import React,{createContext,useContext,useLayoutEffect,useState} from 'react';
import {Moon,Sun,Monitor} from 'lucide-react';
type Theme='light'|'dark'|'system';
const key='maso3-appearance';
function readTheme():Theme{try{const value=localStorage.getItem(key);return value==='light'||value==='dark'?value:'system'}catch{return 'system'}}
const ThemeContext=createContext<{theme:Theme,setTheme:(theme:Theme)=>void}>({theme:'system',setTheme:()=>{}});
export function ThemeProvider({children}:{children:React.ReactNode}){const[theme,setTheme]=useState<Theme>(readTheme);useLayoutEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');const apply=()=>{const resolved=theme==='system'?(media.matches?'dark':'light'):theme;document.documentElement.dataset.theme=resolved;document.documentElement.style.colorScheme=resolved;};apply();try{localStorage.setItem(key,theme)}catch{}media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply)},[theme]);return <ThemeContext.Provider value={{theme,setTheme}}>{children}</ThemeContext.Provider>}
export function ThemeSetting(){const{theme,setTheme}=useContext(ThemeContext);const Icon=theme==='dark'?Moon:theme==='light'?Sun:Monitor;return <label className="theme-setting"><span><Icon size={16}/>Appearance</span><select aria-label="Appearance" value={theme} onChange={e=>setTheme(e.target.value as Theme)}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label>}
