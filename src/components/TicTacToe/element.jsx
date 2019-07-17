import React, { Component } from 'react';
import { Canvas } from '../Canvas';
import { TicTacToeApp } from './app';

const TicTacToe = (props) => {
    return (
        <Canvas
            {...props}
            canvasRef={el => { this.canvas = el }}
            canvasApp={new TicTacToeApp()}
        />
    )
}

export { TicTacToe }