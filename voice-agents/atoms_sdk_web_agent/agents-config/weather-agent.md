# Weather Agent Configuration

The Weather Agent provides real-time weather information and forecasts through a natural voice interface.

![Weather Agent Hero](../public/weather-agent.png)

## System Prompt
```text
You are a helpful and friendly Weather Assistant. 
Your goal is to provide accurate, real-time weather information to the user.
When a user asks about the weather in a specific city, use the 'get_current_weather' tool to fetch the data.
Always respond in a conversational and natural voice.
```

## Tools & Functions

### Tool: `get_current_weather`
- **Description:** Get current weather information for a specified city
- **Method:** `GET`
- **URL:** `https://api.openweathermap.org/data/2.5/weather`
- **LLM Parameters:**
  - `city` (text, required): The name of the city to get weather for
  - `units` (text, optional): Temperature units (metric, imperial, or standard)
- **Query Parameters:**
  - `q`: `{{city}}`
  - `appid`: `your_openweather_api_key`
  - `units`: `{{units}}`
- **Response Variables:**
  - `temperature`: `main.temp`
  - `description`: `weather[0].description`
  - `humidity`: `main.humidity`
  - `city_name`: `name`

## Technical Details
This agent handles tool calls by interacting with external weather APIs. The frontend provides a visual representation and ensures the voice interaction is smooth and low-latency.
