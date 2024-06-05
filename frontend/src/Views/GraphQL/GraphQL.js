import React, { useState } from 'react';
import './styles.css';
import { useQuery, useMutation, gql } from '@apollo/client';

// Consulta GraphQL para obtener todas las canciones
const GET_SONGS = gql`
  query {
    songs {
      id
      title
      artist
      year
      coverImage
    }
  }
`;

// Mutación GraphQL para agregar una canción
const ADD_SONG = gql`
  mutation AddSong($title: String!, $artist: String!, $year: Int!, $coverImage: String) {
    addSong(title: $title, artist: $artist, year: $year, coverImage: $coverImage) {
      id
      title
      artist
      year
      coverImage
    }
  }
`;

function GraphQL() {
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        artist: '',
        year: '',
        coverImage: ''
    });
    const [showJSON, setShowJSON] = useState(false);
    const [showSongs, setShowSongs] = useState(false);

    const { loading, error, data } = useQuery(GET_SONGS, {
        skip: !showSongs,
    });

    const [addSong] = useMutation(ADD_SONG, {
        update(cache, { data: { addSong } }) {
            const { songs } = cache.readQuery({ query: GET_SONGS });
            cache.writeQuery({
                query: GET_SONGS,
                data: { songs: [...songs, addSong] },
            });
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSaveSong = async () => {
        try {
            await addSong({ variables: { ...formData, year: parseInt(formData.year) } });
            setFormData({
                id: null,
                title: '',
                artist: '',
                year: '',
                coverImage: ''
            });
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const toggleJSON = () => {
        setShowJSON(!showJSON);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;

    return (
        <div className="container">
            <h1 className="center">Canciones</h1>
            <div className="center">
                <button onClick={() => setShowSongs(true)} className="styled-button">Cargar Canciones</button>
            </div>
            {showSongs && (
                <>
                    <h2>Agregar Canción</h2>
                    <div>
                        <input type="text" name="title" placeholder="Título" value={formData.title} onChange={handleInputChange} />
                    </div>
                    <div>
                        <input type="text" name="artist" placeholder="Artista" value={formData.artist} onChange={handleInputChange} />
                    </div>
                    <div>
                        <input type="text" name="year" placeholder="Año" value={formData.year} onChange={handleInputChange} />
                    </div>
                    <div>
                        <input type="text" name="coverImage" placeholder="URL de la imagen de la canción" value={formData.coverImage} onChange={handleInputChange} />
                    </div>
                    <div>
                        <button onClick={handleSaveSong}>Guardar</button>
                    </div>

                    <h2>Canciones en la Lista</h2>
                    <ul>
                        {data.songs.map(song => (
                            <li key={song.id}>
                                <h3>{song.title}</h3>
                                <p><strong>Artista:</strong> {song.artist}</p>
                                <p><strong>Año:</strong> {song.year}</p>
                                <img src={song.coverImage} alt={song.title} style={{ maxWidth: '200px' }} />
                            </li>
                        ))}
                    </ul>

                    <button onClick={toggleJSON} className="styled-button">{showJSON ? "Ocultar" : "Mostrar"}</button>
                    {showJSON && <pre>{JSON.stringify(data, null, 2)}</pre>}
                </>
            )}
        </div>
    );
}

export default GraphQL;
