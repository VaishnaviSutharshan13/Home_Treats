#!/bin/bash

# Get a test token first
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.data.token')

echo "Token: $TOKEN"
echo ""

# Try to create a fee
curl -s -X POST http://localhost:5000/api/fees/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "studentId": "STU001",
    "studentName": "Test Student",
    "feeType": "Monthly",
    "amount": 4500,
    "dueDate": "2026-04-30",
    "room": "101",
    "roomNumber": "101",
    "floor": "1",
    "semester": "2026-1"
  }' | jq .
