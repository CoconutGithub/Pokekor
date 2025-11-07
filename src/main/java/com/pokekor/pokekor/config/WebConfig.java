package com.pokekor.pokekor.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * React Router의 SPA(Single Page Application) 라우팅을 지원하기 위한 설정.
     * API 경로(/api/**)가 아닌 모든 요청이 404가 될 경우,
     * /index.html (React 앱 진입점)을 대신 반환합니다.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**") // 모든 경로 요청에 대해
                .addResourceLocations("classpath:/static/") // 'static' 폴더에서 리소스를 찾음
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        // 요청된 리소스(예: /my-collection)가 'static' 폴더에 실제로 존재하지 않으면,
                        Resource requestedResource = location.createRelative(resourcePath);
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // API 요청( /api/** )이 아닌 경우에만 /index.html을 반환
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }

                        // /index.html (React 앱)을 반환
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
