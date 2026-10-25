package com.cfs.BMS.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class AdminKeyFilter extends OncePerRequestFilter {

    @Value("${admin.key:}")
    private String adminKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        return !req.getRequestURI().startsWith("/api/admin")
                || "OPTIONS".equalsIgnoreCase(req.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String given = req.getHeader("X-Admin-Key");
        boolean ok = !adminKey.isBlank() && given != null
                && MessageDigest.isEqual(adminKey.getBytes(StandardCharsets.UTF_8),
                given.getBytes(StandardCharsets.UTF_8));
        if (!ok) {
            res.setStatus(401);
            res.setContentType("application/json");
            res.getWriter().write("{\"message\":\"Invalid or missing admin key\"}");
            return;
        }
        chain.doFilter(req, res);
    }
}