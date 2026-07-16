package com.task.superMarketBilling.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String query = request.getOrDefault("query", "").toLowerCase();
        String reply = "I am a simple support bot. How can I assist you with Bill Bee?";

        if (query.contains("bill") || query.contains("invoice")) {
            reply = "To create a bill, go to 'Create Bill' from the sidebar, add items, and click 'Save and Print'.";
        } else if (query.contains("product")) {
            reply = "You can manage products from the 'Products' section in the Admin Panel.";
        } else if (query.contains("hello") || query.contains("hi") || query.contains("hey")) {
            reply = "Hello! Welcome to Bill Bee support.";
        } else if (query.contains("name") || query.contains("profile")) {
            reply = "You can edit your profile by clicking on your avatar at the top right.";
        } else if (query.contains("category") || query.contains("categories")) {
            reply = "You can manage product categories in the 'Categories' section from the sidebar.";
        }

        return Map.of("reply", reply);
    }
}
