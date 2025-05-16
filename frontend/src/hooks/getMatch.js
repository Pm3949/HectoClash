import { useEffect } from "react";
import socket from "../socket/socket";

const useMatchSocket = (authUser, setMatch, setOpponentInfo) => {
  useEffect(() => {
    if (!authUser) return;

    socket.connect();

    socket.emit("joinQueue", authUser.userName);

    socket.on("matchStarted", (match) => {
      console.log("Match started via socket:", match);
      setMatch(match);

      const opponentUser =
        match.player1.userName === authUser.userName
          ? match.player2
          : match.player1;

      const opponent = {
        name: opponentUser.userName,
        rating: opponentUser.rating || 0,
        avatar: opponentUser.userName[0].toUpperCase(),
        avatarColor: "bg-purple-600",
      };

      setOpponentInfo(opponent);
    });

    return () => {
      socket.off("matchStarted");
      socket.disconnect();
    };
  }, [authUser, setMatch, setOpponentInfo]);
};

export default useMatchSocket;
