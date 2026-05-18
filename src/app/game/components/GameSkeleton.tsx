import styles from "../game.module.css";

export default function GameSkeleton() {
  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
        <div
          style={{
            height: "2rem",
            background: "var(--neutral-300)",
            borderRadius: "8px",
            width: "150px",
          }}
        />
        <div
          style={{
            height: "3rem",
            background: "var(--neutral-300)",
            borderRadius: "8px",
            width: "120px",
          }}
        />
        <div style={{ display: "flex", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: "2.5rem",
                height: "2.5rem",
                background: "var(--neutral-300)",
                borderRadius: "8px",
              }}
            />
          ))}
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.gameCenter}>
          <div
            style={{
              height: "2rem",
              background: "var(--neutral-300)",
              borderRadius: "8px",
              width: "200px",
              marginBottom: "1rem",
            }}
          />
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "var(--neutral-300)",
            }}
          />
          <div
            style={{
              height: "2rem",
              background: "var(--neutral-300)",
              borderRadius: "8px",
              width: "180px",
              marginTop: "1rem",
            }}
          />

          <div style={{ marginTop: "2rem", width: "100%", maxWidth: "520px" }}>
            <div
              style={{
                height: "2rem",
                background: "var(--neutral-300)",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    background: "var(--neutral-300)",
                    borderRadius: "12px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "350px",
          }}
        >
          <div
            style={{
              height: "2rem",
              background: "var(--neutral-300)",
              borderRadius: "8px",
            }}
          />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: "4rem",
                background: "var(--neutral-300)",
                borderRadius: "12px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
