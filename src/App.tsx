import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Button, Card, CardContent, CardHeader, IconButton, Stack, Input } from "@mui/material";
import { Pause, PlayArrow, Refresh } from "@mui/icons-material";
const playDingSound = () => {
  const audioContext = new window.AudioContext(); // 오디오 컨텍스트 생성
  const oscillator = audioContext.createOscillator(); // 오실레이터 생성
  const gainNode = audioContext.createGain(); // 볼륨 조절을 위한 GainNode 생성

  oscillator.type = "sine"; // 사인파로 소리 생성
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // 주파수 설정 (1000Hz)

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // 볼륨 설정 (0.1로 낮추어 설정)

  oscillator.connect(gainNode); // 오실레이터를 GainNode에 연결
  gainNode.connect(audioContext.destination); // GainNode를 오디오 컨텍스트에 연결

  oscillator.start(); // 소리 시작
  oscillator.stop(audioContext.currentTime + 0.5); // 0.1초 후에 소리 멈춤
};

const TimerCardComponent = ({
  timerIndex,
  timersPerRow,
  gapProvided,
}: {
  timerIndex: number;
  timersPerRow: number;
  gapProvided: number;
}) => {
  const [secondsLeft, setSecondsLeft] = useState(Number(localStorage.getItem(`timer-${timerIndex}-seconds-left`)) || 0);
  const [originalFullTime, setOriginalFullTime] = useState(Number(localStorage.getItem(`timer-${timerIndex}-original-full-time`)) || 0);
  const [timerState, setTimerState] = useState<"NEW" | "RUNNING" | "PAUSE">("NEW");
  const [timerLabel, setTimerLabel] = useState(`타이머 ${timerIndex + 1}`);
  const [timerLabelEditMode, setTimerLabelEditMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timerState === "RUNNING") {
        if (secondsLeft === 0) {
          setTimerState("PAUSE");
          // Save to local storage
          localStorage.setItem(`timer-${timerIndex}-original-full-time`, originalFullTime.toString());
          localStorage.setItem(`timer-${timerIndex}-seconds-left`, secondsLeft.toString());

          // TODO: Play sound
          playDingSound();
        } else {
          setSecondsLeft((prev) => prev - 1);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, timerState]);

  return (
    <Card sx={{ width: `calc(${100 / timersPerRow}% - ${gapProvided * 8}px)` }}>
      <CardHeader
        action={
          <Stack direction="row-reverse" gap={1} width="100%">
            {timerState === "RUNNING" ? (
              <IconButton onClick={() => setTimerState("PAUSE")}>
                <Pause />
              </IconButton>
            ) : timerState === "PAUSE" ? (
              <>
                <IconButton onClick={() => setTimerState("RUNNING")}>
                  <PlayArrow />
                </IconButton>
                <IconButton onClick={() => setTimerState("NEW")}>
                  <Refresh />
                </IconButton>
              </>
            ) : (
              <IconButton
                onClick={() => {
                  const time =
                    Math.floor(Number((document.getElementById(`${timerIndex}-minute`) as any).value) * 60) +
                    Number((document.getElementById(`${timerIndex}-second`) as any).value);
                  setSecondsLeft(time);
                  setOriginalFullTime(time);
                  setTimerState("RUNNING");
                }}>
                <PlayArrow />
              </IconButton>
            )}
          </Stack>
        }
        title={
          timerLabelEditMode ? (
            <Stack direction="row" gap={1}>
              <Input sx={{ flex: 0.8 }} type="text" value={timerLabel} onChange={(e) => setTimerLabel(e.target.value as any)} />
              <Button sx={{ flex: 0.2 }} onClick={() => setTimerLabelEditMode(false)}>
                완료
              </Button>
            </Stack>
          ) : (
            <Typography variant="h6" onClick={() => setTimerLabelEditMode(true)}>
              {timerLabel}
            </Typography>
          )
        }
      />
      {timerState === "NEW" ? (
        <CardContent sx={{ display: "flex", textAlign: "center", gap: 2, justifyContent: "center", alignItems: "center" }}>
          <input
            type="number"
            min={0}
            max={999}
            style={{ width: 100, height: 50, textAlign: "center", fontSize: "2rem" }}
            id={`${timerIndex}-minute`}
          />
          <span>:</span>
          <input
            type="number"
            min={0}
            max={59}
            style={{ width: 100, height: 50, textAlign: "center", fontSize: "2rem" }}
            id={`${timerIndex}-second`}
          />
        </CardContent>
      ) : (
        <CardContent sx={{ textAlign: "center" }}>
          <Typography
            variant={(() => {
              switch (timersPerRow) {
                case 1:
                  return "h1";
                case 2:
                  return "h1";
                case 3:
                  return "h2";
                case 4:
                  return "h3";
                case 5:
                  return "h3";
                default:
                  return "h6";
              }
            })()}>{`${String(Math.floor(secondsLeft / 60))} : ${String(secondsLeft % 60).padStart(2, "0")}`}</Typography>
          <Typography variant="body1">{`${String(Math.floor(originalFullTime / 60))} : ${String(originalFullTime % 60).padStart(
            2,
            "0"
          )}`}</Typography>
        </CardContent>
      )}
    </Card>
  );
};

const App = () => {
  const [timerCount, setTimerCount] = useState(4);
  const [timersPerRow, setTimersPerRow] = useState(2);
  const GAP_BETWEEN_TIMERS = 1;

  return (
    <>
      <Card sx={{ width: "240px", mt: 2, position: "absolute", bottom: "24px", right: "24px" }}>
        <CardContent>
          <Stack direction="row" gap={1}>
            <Typography sx={{ flex: 0.7 }} variant="h6">
              타이머 개수
            </Typography>
            <Input
              sx={{ flex: 0.3 }}
              type="number"
              value={timerCount}
              onChange={(e) => {
                if (Number(e.target.value) < 1) return;
                if (Number(e.target.value) < timersPerRow) return;
                setTimerCount(Number(e.target.value));
              }}
            />
          </Stack>
          <Stack direction="row" gap={1} mt={2}>
            <Typography sx={{ flex: 0.7 }} variant="h6">
              행 당 개수
            </Typography>
            <Input
              sx={{ flex: 0.3 }}
              type="number"
              value={timersPerRow}
              onChange={(e) => {
                if (Number(e.target.value) < 1) return;
                if (Number(e.target.value) > timerCount) return;
                setTimersPerRow(Number(e.target.value));
              }}
            />
          </Stack>
        </CardContent>
      </Card>
      <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", gap: 2, height: "100vh", overflowY: "scroll" }}>
        <Stack sx={{ flexWrap: "wrap", flexDirection: "row" }} gap={GAP_BETWEEN_TIMERS}>
          {Array.from({ length: timerCount }).map((_, index) => (
            <TimerCardComponent timerIndex={index} timersPerRow={timersPerRow} gapProvided={GAP_BETWEEN_TIMERS} />
          ))}
        </Stack>
      </Container>
    </>
  );
};

export default App;
