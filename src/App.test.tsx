import { render, screen } from '@testing-library/react'
import App from './App'

describe('Weather App', () => {
    it('renders the app title', () => {
        render(<App />)
        const titleElement = screen.getByRole('heading', { name: /weather app/i })
        expect(titleElement).toBeInTheDocument()
    })
})
