// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///E:/develop/Vue3Project/AskVistaX/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/develop/Vue3Project/AskVistaX/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueDevTools from "file:///E:/develop/Vue3Project/AskVistaX/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///E:/develop/Vue3Project/AskVistaX/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    vueDevTools()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  //跨域
  server: {
    proxy: {
      "/api": {
        //获取路径中包含了/api的请求
        target: "http://localhost:8445",
        //后台服务所在的源
        changeOrigin: true,
        //修改源
        rewrite: (path) => path.replace(/^\/api/, "")
        //'/api'替换为''
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxkZXZlbG9wXFxcXFZ1ZTNQcm9qZWN0XFxcXEFza1Zpc3RhWFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcZGV2ZWxvcFxcXFxWdWUzUHJvamVjdFxcXFxBc2tWaXN0YVhcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L2RldmVsb3AvVnVlM1Byb2plY3QvQXNrVmlzdGFYL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnXG5cbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHZ1ZSgpLFxuICAgIHZ1ZURldlRvb2xzKCksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSlcbiAgICB9LFxuICB9LFxuXG4gIC8vXHU4REU4XHU1N0RGXG4gIHNlcnZlcjp7XG4gICAgcHJveHk6e1xuICAgICAgJy9hcGknOnsvL1x1ODNCN1x1NTNENlx1OERFRlx1NUY4NFx1NEUyRFx1NTMwNVx1NTQyQlx1NEU4Ni9hcGlcdTc2ODRcdThCRjdcdTZDNDJcbiAgICAgICAgdGFyZ2V0OidodHRwOi8vbG9jYWxob3N0Ojg0NDUnLC8vXHU1NDBFXHU1M0YwXHU2NzBEXHU1MkExXHU2MjQwXHU1NzI4XHU3Njg0XHU2RTkwXG4gICAgICAgIGNoYW5nZU9yaWdpbjp0cnVlLC8vXHU0RkVFXHU2NTM5XHU2RTkwXG4gICAgICAgIHJld3JpdGU6KHBhdGgpPT5wYXRoLnJlcGxhY2UoL15cXC9hcGkvLCcnKS8vJy9hcGknXHU2NkZGXHU2MzYyXHU0RTNBJydcbiAgICAgfVxuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFIsU0FBUyxlQUFlLFdBQVc7QUFFN1QsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8saUJBQWlCO0FBSnVKLElBQU0sMkNBQTJDO0FBT2hPLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxRQUFPO0FBQUEsSUFDTCxPQUFNO0FBQUEsTUFDSixRQUFPO0FBQUE7QUFBQSxRQUNMLFFBQU87QUFBQTtBQUFBLFFBQ1AsY0FBYTtBQUFBO0FBQUEsUUFDYixTQUFRLENBQUMsU0FBTyxLQUFLLFFBQVEsVUFBUyxFQUFFO0FBQUE7QUFBQSxNQUMzQztBQUFBLElBQ0Q7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
