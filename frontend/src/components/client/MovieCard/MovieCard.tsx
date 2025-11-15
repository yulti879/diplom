import { MoviePoster } from '../MoviePoster/MoviePoster';
import { MovieDescription } from '../MovieDescription/MovieDescription';
import { HallSchedule } from '../HallSchedule/HallSchedule';
import type { ClientMovie } from '../../../types/client';
import './MovieCard.css';

interface MovieCardProps {
    movie: ClientMovie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    return (
        <section className="movie">
            <div className="movie__info">
                <MoviePoster title={movie.title} poster={movie.poster} />
                <MovieDescription
                    title={movie.title}
                    synopsis={movie.synopsis}
                    duration={movie.duration}
                    origin={movie.origin}
                />
            </div>

            {movie.halls.map((hall, index) => (
                <HallSchedule
                    key={index}
                    hall={hall}
                    movieTitle={movie.title}
                />
            ))}
        </section>
    );
};