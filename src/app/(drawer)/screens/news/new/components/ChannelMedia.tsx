import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Download } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius } from "@/constants/layout";

type Props = {
  imageUrls: string[];
  sizeLabel?: string;
  onImagePress: (index: number) => void;
  onDownload?: () => void;
};

type GridCell = {
  uri: string;
  index: number;
  overlayCount?: number;
};

function buildGridCells(imageUrls: string[]): GridCell[] {
  const count = imageUrls.length;

  if (count <= 3) {
    return imageUrls.map((uri, index) => ({ uri, index }));
  }

  return imageUrls.slice(0, 4).map((uri, index) => ({
    uri,
    index,
    overlayCount: index === 3 && count > 4 ? count - 4 : undefined,
  }));
}

function getGridLayout(count: number) {
  if (count === 1) return "single" as const;
  if (count === 2) return "double" as const;
  if (count === 3) return "triple" as const;
  return "quad" as const;
}

export default function ChannelMedia({
  imageUrls,
  sizeLabel,
  onImagePress,
  onDownload,
}: Props) {
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const layout = getGridLayout(imageUrls.length);
  const cells = buildGridCells(imageUrls);

  if (imageUrls.length === 0) return null;

  const renderImage = (cell: GridCell, imageStyle: object) => (
    <>
      <Image
        source={{ uri: cell.uri }}
        style={[styles.image, imageStyle]}
        contentFit="cover"
        onLoadStart={() =>
          setLoadingIds((prev) => ({ ...prev, [cell.uri]: true }))
        }
        onLoadEnd={() =>
          setLoadingIds((prev) => ({ ...prev, [cell.uri]: false }))
        }
      />
      {loadingIds[cell.uri] ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.textInverse} size="small" />
        </View>
      ) : null}
      {cell.overlayCount ? (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>+{cell.overlayCount}</Text>
        </View>
      ) : null}
    </>
  );

  return (
    <View style={styles.wrapper}>
      {layout === "single" ? (
        <Pressable
          style={styles.singleCell}
          onPress={() => onImagePress(cells[0].index)}
        >
          {renderImage(cells[0], styles.singleImage)}
        </Pressable>
      ) : null}

      {layout === "double" ? (
        <View style={styles.row}>
          {cells.map((cell) => (
            <Pressable
              key={cell.uri}
              style={styles.halfCell}
              onPress={() => onImagePress(cell.index)}
            >
              {renderImage(cell, styles.doubleImage)}
            </Pressable>
          ))}
        </View>
      ) : null}

      {layout === "triple" ? (
        <View style={styles.tripleRow}>
          <Pressable
            style={styles.tripleMainCell}
            onPress={() => onImagePress(cells[0].index)}
          >
            {renderImage(cells[0], styles.tripleMainImage)}
          </Pressable>
          <View style={styles.tripleSideColumn}>
            {cells.slice(1).map((cell) => (
              <Pressable
                key={cell.uri}
                style={styles.tripleSideCell}
                onPress={() => onImagePress(cell.index)}
              >
                {renderImage(cell, styles.tripleSideImage)}
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {layout === "quad" ? (
        <View style={styles.quadGrid}>
          {cells.map((cell) => (
            <Pressable
              key={cell.uri}
              style={styles.quadCell}
              onPress={() => onImagePress(cell.index)}
            >
              {renderImage(cell, styles.quadImage)}
            </Pressable>
          ))}
        </View>
      ) : null}

      {sizeLabel ? (
        <Pressable style={styles.downloadBadge} onPress={onDownload}>
          <Download size={14} color={Colors.textInverse} strokeWidth={2.5} />
          <Text style={styles.sizeLabel}>{sizeLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const GRID_HEIGHT = 260;

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "hidden",
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  row: {
    flexDirection: "row",
    gap: 2,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.surfaceAlt,
  },
  singleCell: {
    width: "100%",
  },
  singleImage: {
    aspectRatio: 16 / 9,
  },
  halfCell: {
    flex: 1,
    height: GRID_HEIGHT,
  },
  doubleImage: {
    flex: 1,
  },
  tripleRow: {
    flexDirection: "row",
    gap: 2,
    height: GRID_HEIGHT,
  },
  tripleMainCell: {
    flex: 1.05,
    overflow: "hidden",
  },
  tripleMainImage: {
    flex: 1,
  },
  tripleSideColumn: {
    flex: 1,
    gap: 2,
  },
  tripleSideCell: {
    flex: 1,
    overflow: "hidden",
  },
  tripleSideImage: {
    flex: 1,
  },
  quadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    height: GRID_HEIGHT,
  },
  quadCell: {
    width: "49.5%",
    height: (GRID_HEIGHT - 2) / 2,
    overflow: "hidden",
  },
  quadImage: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.overlayLight,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayText: {
    color: Colors.textInverse,
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize["3xl"],
  },
  downloadBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.lg,
  },
  sizeLabel: {
    color: Colors.textInverse,
    fontFamily: FontFamily.utility,
    fontSize: FontSize.xs,
  },
});
