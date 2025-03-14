
class GameStatus {
    constructor(){
    }



    setProgress(value){
        this.progress.value = value;
    }

    getProgress(){
        return this.progress.value;
    }

    render(){
        return this.progress;
    }
}

