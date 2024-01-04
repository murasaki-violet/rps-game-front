import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [isName,setIsName] = useState(false)
  const [name,setName] = useState("")
  const [room,setRoom] = useState("")
  const [myUserId,setMyUserId] = useState("")
  const [matchName,setMatchName] = useState("")
  const [hand,setHand] = useState("")
  const [gameSet,setGameSet] = useState("")


  useEffect(() => {
    // 初回のみsocket.ioのインスタンスを作成
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL);

    setSocket(newSocket);

    // クリーンアップ関数でsocketを切断
    return () => newSocket.close();
  }, []);


  //[isName, hand, socket]のuseEffect
  useEffect(() => {
    //部屋・名前の設定があるか
    if(name !== "" && room !== "" ){


      //usaeIDの取得
      socket.on('userid',userid => setMyUserId(userid))

      //ルームに入室
      socket.emit('joinRoom', 
        {
            "name": name, 
            "room": room
        }
      );

      //ルームに入室にエラーがあれば、リロード
      socket.on("roomError",() => window.location.reload());

      //現在の部屋の状態
      socket.on("roomer",message => {
        const result = message.filter(e => e.name !== name);
        if(result.length > 0){
          setMatchName(result[0].name)
        }
      });

      //handが変更になって空白
      if(hand !== ""){
        socket.emit('pon',
        {
          room:room,
          hand:hand
        })
      }

      //勝ち負け情報の取得
      //買った方のuserIDが投げられてくる
      socket.on("winner",winner => {
        
        if(hand === ""){
          return
        }

        if(winner === "draw"){
          setHand("")
        }else{
          if(winner === myUserId){
            setGameSet("勝ち");
          }else if(winner !== myUserId){
            setGameSet("負け");
          }
        }
      });

    //部屋・名前の設定が無い場合の設定
    }else{
      setIsName(false)
    }
  
  }, [isName, hand, socket, myUserId]);

  //ジャンケンの手の表示を行う
  const showHand = (hand) =>{
    if(hand === "rock"){
      return "グー"
    }else if(hand === "scissors"){
      return "チョキ"
    }
    else{
      return "パー"
    }
  }


  return (
    <>
      {console.log(myUserId)}
      {!isName && (
      <>
        <div
          className=" w-screen p-4 my-2 text-5xl text-center"
        >
          ジャンケンゲーム
        </div>
        <input 
          className=" w-screen p-4 my-2 text-xl text-center border-2 border-black "
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="あなたの名前を入力してね！"
        />
  
        <input 
          className=" w-screen p-4 my-2 text-xl text-center border-2 border-black "
          type="text" 
          value={room} 
          onChange={(e) => setRoom(e.target.value)} 
          placeholder="相手と決めた部屋の名前を入力してね！"
        />
        <button 
          className=" flex m-10 p-4 items-center border-2 text-3xl border-gray-600" 
          onClick={() => setIsName(true)}
        >入室</button>
      </>
      )}

      {isName && (
      <>
        {myUserId === "" ?(
          <>
            <div
            className=" w-screen p-4 my-2 text-5xl text-center"
            >
              ジャンケンゲーム
            </div>
            サーバー起動中 無料サーバーだから時間がかかるよ!
          </>
        ):(
          <>
            <div
            className=" w-screen p-4 my-2 text-5xl text-center"
            >
              ジャンケンゲーム
            </div>
            <div
            className=" w-screen p-4 my-2 text-5xl text-center"
            >
              {`現在は[${room}]部屋にいます。`}
            </div>
            <div>{`こんにちは、${name}さん`}</div>
            {matchName === "" ? (
              <div>現在対戦相手はいません</div>
            ):(
              <>
                <div>{`対戦相手は${matchName}さんです。`}</div>
                {hand === "" ? (
                <>
                  <div>それでは、ジャンケン</div>
                  <button className=" border-2" onClick={() => setHand("rock")}>グー</button>
                  <button className=" border-2" onClick={() => setHand("scissors")}>チョキ</button>
                  <button className=" border-2" onClick={() => setHand("paper")}>パー</button><br/>
                  でポン!
                </>
                ):(
                  <>
                    <div>あなたは{showHand(hand)}を出しました。</div>
                    {gameSet === "" ?
                      <>
                        <div>対戦相手を待っています.....</div>
                        <div>[あいこの場合は、再選択になります]</div>
                      </>
                      :
                      <>
                        <div>あなたの{gameSet}です。</div>
                        再戦はリロード！
                      </>
                    }
                  </>
                )}
              </>
            )}
          </>
        )}
      </>
      )}
    </>
  )
}