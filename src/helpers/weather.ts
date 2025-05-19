import { RequestHandler, Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { WEATHER_API } from "../constants";
import { config } from '../config';
import { Weather } from "../types";

export const getWeather: RequestHandler = async (req: Request, res: Response) => {
    const { city } = req.query;

    if (!city) {
        res.status(400).json({ error: 'City parameter is required' });
        return;
    }

    // Return mock data in development mode
    if (config.weather.apiKey === 'development') {
        const mockWeather: Weather = {
            temperature: 20,
            humidity: 65,
            description: 'Mock weather data'
        };
        res.json(mockWeather);
        return;
    }

    try {
        const weatherResponse = await axios.get(`${WEATHER_API}?key=${config.weather.apiKey}&q=${city}`)
        console.log(`Fetching weather for city: ${city}`, weatherResponse.data); 
        const weatherResult: Weather = {
            temperature: weatherResponse.data.current['temp_c'],
            humidity: weatherResponse.data.current.humidity,
            description: weatherResponse.data.current.condition.text
        }
        res.json(weatherResult);
    } catch(error) {
        console.error('Error: ', error instanceof AxiosError ? error.response?.data : error);
        if (error instanceof AxiosError && error.response?.data.error.code === 1006) {
            res.status(404).json({ error: `City '${city}' not found.`})
        } else {
            res.status(400).json({ error: 'Invalid request' })
        }
    }
};