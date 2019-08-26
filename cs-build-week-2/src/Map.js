import React from 'react';
import axios from "axios";

class Map extends React.Component {

    // local storage for refresh / persistent state 

    constructor(props) {
        super(props)
        this.state = {
            userToken: "ca85b924c142e360a5e54ae55feeb6cc0e65a735",
            startingRoom: "",
            visitedRooms: []
        }
    }

    async componentDidMount() {
        try {
            const response = await axios.get("https://lambda-treasure-hunt.herokuapp.com/api/adv/init/", {'headers': { 'Authorization': `Token ${this.state.userToken}` } })
            const currentRoom = JSON.stringify(response.data);
            console.log(currentRoom)
            localStorage.setItem("currentRoom", currentRoom);
            this.setState({startingRoom: currentRoom})
        }
        catch(err) {
            console.log(err);
        }
    }
  
    autoTraversal = e => {
        if (this.state.startingRoom != null) {

            let curRoom = JSON.parse(localStorage.getItem("currentRoom")).room_id; 
            console.log(curRoom)  
            var visited = [];
            // step 1 
            // each time we call the axios call, we do depth first search
            // until the end 
            let newGraph = {}
            newGraph[curRoom] = {"n": "?", "s": "?", "w": "?", "e": "?"} 
            console.log("what our currentGraphis", newGraph)

            while (visited.length < 500) {
                let directions = JSON.parse(localStorage.getItem("currentRoom")).exits;
                let cooldownTime = JSON.parse(localStorage.getItem("currentRoom")).cooldown;
                if (!visited.includes(curRoom)){
                    console.log("visiting", curRoom)
                    for (let direction in newGraph[curRoom]){
                        console.log("before pushing to array", curRoom)
                        console.log("syntax check", directions.includes(direction))
                        if (newGraph[curRoom][direction] == "?" && directions.includes(direction))
                        {
                            console.log("Time to visit")
                            console.log("visited", visited)
                            // console.log("line 55", curRoom);
                            visited.push(curRoom)
                            console.log(visited)
                            // visited.push(curRoom)
                            this.move(direction)
                            let nextRoom = JSON.parse(localStorage.getItem("nextRoom"))
                            console.log("line 61", nextRoom)
                            let nextRoomId = nextRoom.room_id

                            newGraph[nextRoomId] = this.refactorRooms(nextRoom.exits)
                            newGraph[nextRoomId][direction] = this.getOppositeDirections(direction)

                            newGraph[curRoom][direction] = nextRoom.room_id
                            curRoom = nextRoomId
                            localStorage.setItem("currentRoom", JSON.stringify(nextRoom))
                            break
                        }
                        else if (newGraph[curRoom][direction] == "?" && !directions.includes(direction)) {
                            console.log("Dont visit");
                            newGraph[curRoom][direction] = ""
                        }
                    }
                }
                else {
                    var queue = [];
                    queue.push(curRoom)
                    while (queue.length > 0) {
                        curRoom = queue.shift()
                        if (visited.includes(curRoom)) {
                            // let directions = JSON.parse(localStorage.getItem("currentRoom")).exits;
                            // let cooldownTime = JSON.parse(localStorage.getItem("currentRoom")).cooldown;
                            // console.log(cooldownTime)
                            console.log(curRoom)

                            for (let direction in newGraph[curRoom]) {
                                if (newGraph[curRoom][direction] == "?" && directions.includes(direction))
                                {
                                    visited.push(curRoom)
                                    this.move(direction)
                                    let nextRoom = JSON.parse(localStorage.getItem("nextRoom"))
                                    console.log(nextRoom)
                                    let nextRoomId = nextRoom.room_id

                                    newGraph[nextRoomId] = this.refactorRooms(nextRoom.exits)
                                    newGraph[nextRoomId][direction] = this.getOppositeDirections(direction)

                                    newGraph[curRoom][direction] = nextRoom.room_id
                                    let curRoom = nextRoomId
                                    localStorage.setItem("currentRoom", JSON.stringify(nextRoom))
                                    break
                                }
                                else if (!directions.includes(direction)) 
                                {
                                    newGraph[curRoom][direction] = "" 
                                }
                                else if (newGraph[curRoom][direction] != "?")
                                {
                                    let bfs_roomId = newGraph[curRoom][direction]
                                    console.log("direction", direction)
                                    console.log("push this in queue", bfs_roomId)
                                    queue.push(bfs_roomId)
                                }
                            }
                        }
                    }
                }


            }
            this.setState({visitedRooms: visited})
        }
    }

    refactorRooms = arr => {
        let newDict = {}
        for (let direction in arr) {
            newDict[direction] = "?" 
        } 
        return newDict
    }

    getOppositeDirections = (dir) => {
        if (dir == "n") {
            return "s";
        }
        else if (dir == "s") {
            return "n";
        }
        else if (dir == "w") {
            return "e";
        }
        else if (dir == "e") {
            return "w";
        }
    } 
    
    async move(dir) {
        try {
            const response = await axios.post(" https://lambda-treasure-hunt.herokuapp.com/api/adv/move/", 
            {"direction": dir}, {headers: { 'Authorization': `Token ${this.state.userToken}`} });
            const currentRoom =  JSON.stringify(response.data);
            localStorage.setItem("nextRoom", currentRoom);
            let test = localStorage.getItem("nextRoom");
            console.log("test next room", test)
        }
        catch(err) {
            console.log(err);
        }
    }

    render() {
        return (
            <div className="Map">
                {this.state.startingRoom}
                {this.state.visitedRooms}
                <button onClick={this.autoTraversal}>Auto-Traverse</button>
            </div>
        )
    }
}

export default Map