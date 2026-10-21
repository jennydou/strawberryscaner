
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Alert,
} from "react-native";
import Svg, { Circle, Rect, Line } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getReceipts,
  saveReceipt,
  deleteReceipt,
  type Receipt,
} from "./storage/receiptsStorage";

type Tab = "Home" | "Statistics" | "History" | "Scan";

const COLORS = [
  "#A78BFA",
  "#22C55E",
  "#F59E0B",
  "#38BDF8",
  "#F472B6",
  "#FB7185",
];

const money = (value: number) => `€ ${value.toFixed(2)}`;

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] =
    useState<string | null>(null);

  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState("");

  const { width } = useWindowDimensions();

  const theme = {
    background: isDark ? "#10141D" : "#F3F5FA",
    card: isDark ? "#202838" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#172033",
    muted: isDark ? "#A6B1C2" : "#64748B",
    border: isDark ? "#303849" : "#E2E8F0",
    accent: isDark ? "#A78BFA" : "#7654D8",
    active: isDark ? "#303849" : "#EEE9FF",
  };

  // Load receipts and saved theme
  useEffect(() => {
    async function loadData() {
      try {
        const savedReceipts = await getReceipts();
        setReceipts(savedReceipts);

        const savedTheme = await AsyncStorage.getItem(
          "app_theme"
        );

        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark");
        }
      } catch (error) {
        setStorageError(String(error));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Change and save theme
  async function toggleTheme() {
    const next = !isDark;
    setIsDark(next);

    try {
      await AsyncStorage.setItem(
        "app_theme",
        next ? "dark" : "light"
      );
    } catch (error) {
      console.error("Theme save error:", error);
    }
  }

  // Add sample receipt
  async function addTestReceipt() {
    try {
      setStorageError("");

      const receipt: Receipt = {
        id: `test-${Date.now()}`,
        store: "Rimi",
        date: "2026-10-21",
        time: "15:30",
        total: 6.63,
        items: [
          {
            name: "Milk",
            quantity: 1,
            price: 1.19,
            category: "Groceries",
          },
          {
            name: "Bread",
            quantity: 1,
            price: 1.45,
            category: "Groceries",
          },
          {
            name: "Shampoo",
            quantity: 1,
            price: 3.99,
            category: "Hygiene",
          },
        ],
      };

      await saveReceipt(receipt);
      setReceipts(await getReceipts());
    } catch (error) {
      setStorageError(String(error));
    }
  }

  // Delete receipt
  async function removeReceipt(id: string) {
    try {
      await deleteReceipt(id);
      setReceipts(await getReceipts());
      setSelectedReceipt(null);
    } catch (error) {
      setStorageError(String(error));
    }
  }

  // Calculate total
  const total = receipts.reduce(
    (sum, receipt) => sum + receipt.total,
    0
  );

  // Calculate spending by category
  const categories: Record<string, number> = {};

  receipts.forEach((receipt) => {
    receipt.items.forEach((item) => {
      categories[item.category] =
        (categories[item.category] || 0) + item.price;
    });
  });

  const chartData = Object.entries(categories).map(
    ([name, amount], index) => ({
      name,
      amount,
      color: COLORS[index % COLORS.length],
    })
  );

  const chartTotal = chartData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // Calculate monthly spending
  const monthly: Record<string, number> = {};

  receipts.forEach((receipt) => {
    const month = receipt.date.slice(0, 7);
    monthly[month] = (monthly[month] || 0) + receipt.total;
  });

  const monthlyData = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  const maxMonthly = Math.max(
    1,
    ...monthlyData.map((item) => item.amount)
  );

  // Receipt history
  const renderReceipts = () => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card },
      ]}
    >
      {receipts.length === 0 ? (
        <Text style={{ color: theme.muted }}>
          No receipts yet
        </Text>
      ) : (
        receipts.map((receipt) => (
          <View
            key={receipt.id}
            style={[
              styles.receipt,
              { borderBottomColor: theme.border },
            ]}
          >
            <Pressable
              style={styles.receiptHeader}
              onPress={() =>
                setSelectedReceipt(
                  selectedReceipt === receipt.id
                    ? null
                    : receipt.id
                )
              }
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.store,
                    { color: theme.text },
                  ]}
                >
                  {receipt.store}
                </Text>
                <Text style={{ color: theme.muted }}>
                  {receipt.date}
                </Text>
              </View>

              <Text
                style={[
                  styles.price,
                  { color: theme.accent },
                ]}
              >
                {money(receipt.total)}
              </Text>

              <Text
                style={[
                  styles.arrow,
                  { color: theme.muted },
                ]}
              >
                {selectedReceipt === receipt.id ? "⌃" : "⌄"}
              </Text>
            </Pressable>

            {selectedReceipt === receipt.id && (
              <View
                style={[
                  styles.itemsContainer,
                  { borderTopColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.itemsTitle,
                    { color: theme.text },
                  ]}
                >
                  Purchased Items
                </Text>

                {receipt.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.itemName,
                          { color: theme.text },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={{ color: theme.muted }}>
                        {item.category} · Qty: {item.quantity}
                      </Text>
                    </View>

                    <Text
                      style={{ color: theme.accent }}
                    >
                      {money(item.price)}
                    </Text>
                  </View>
                ))}

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => removeReceipt(receipt.id)}
                >
                  <Text style={styles.deleteText}>
                    Delete Receipt
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  // Donut chart
  const renderCategoryChart = () => {
    const radius = 75;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card },
        ]}
      >
        {chartTotal > 0 ? (
          <>
            <View style={styles.chartContainer}>
              <Svg width={200} height={200}>
                <Circle
                  cx={100}
                  cy={100}
                  r={radius}
                  stroke={theme.border}
                  strokeWidth={30}
                  fill="none"
                />

                {chartData.map((item, index) => {
                  const length =
                    (item.amount / chartTotal) *
                    circumference;

                  const start = offset;
                  offset += length;

                  return (
                    <Circle
                      key={index}
                      cx={100}
                      cy={100}
                      r={radius}
                      stroke={item.color}
                      strokeWidth={30}
                      fill="none"
                      strokeDasharray={`${length} ${circumference}`}
                      strokeDashoffset={-start}
                      rotation={-90}
                      origin="100, 100"
                    />
                  );
                })}
              </Svg>

              <View style={styles.chartCenter}>
                <Text style={{ color: theme.muted }}>
                  Total
                </Text>
                <Text
                  style={[
                    styles.chartAmount,
                    { color: theme.text },
                  ]}
                >
                  {money(chartTotal)}
                </Text>
              </View>
            </View>

            {chartData.map((item) => (
              <View
                key={item.name}
                style={styles.legendRow}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: item.color },
                  ]}
                />

                <Text
                  style={[
                    styles.legendName,
                    { color: theme.text },
                  ]}
                >
                  {item.name}
                </Text>

                <Text
                  style={[
                    styles.legendAmount,
                    { color: theme.text },
                  ]}
                >
                  {money(item.amount)}
                </Text>

                <Text
                  style={[
                    styles.percent,
                    { color: theme.muted },
                  ]}
                >
                  {(
                    (item.amount / chartTotal) *
                    100
                  ).toFixed(1)}
                  %
                </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={{ color: theme.muted }}>
            No spending data yet
          </Text>
        )}
      </View>
    );
  };

  // Monthly chart
  const renderMonthlyChart = () => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card },
      ]}
    >
      {monthlyData.length === 0 ? (
        <Text style={{ color: theme.muted }}>
          No monthly data yet
        </Text>
      ) : (
        <>
          <Text
            style={[
              styles.cardTitle,
              { color: theme.text },
            ]}
          >
            Monthly Spending
          </Text>

          <ScrollView horizontal>
            <View style={styles.barChart}>
              {monthlyData.map((item) => {
                const barHeight =
                  (item.amount / maxMonthly) * 160;

                return (
                  <View
                    key={item.month}
                    style={styles.barColumn}
                  >
                    <Text
                      style={[
                        styles.barValue,
                        { color: theme.text },
                      ]}
                    >
                      {money(item.amount)}
                    </Text>

                    <Svg width={70} height={170}>
                      <Line
                        x1={35}
                        y1={0}
                        x2={35}
                        y2={170}
                        stroke={theme.border}
                        strokeWidth={1}
                      />

                      <Rect
                        x={13}
                        y={170 - barHeight}
                        width={44}
                        height={barHeight}
                        rx={7}
                        fill={theme.accent}
                      />
                    </Svg>

                    <Text
                      style={[
                        styles.barLabel,
                        { color: theme.muted },
                      ]}
                    >
                      {item.month}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Header with theme button */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: theme.text },
              ]}
            >
              Receipt Tracker
            </Text>

            <Pressable
              onPress={toggleTheme}
              style={[
                styles.themeButton,
                { backgroundColor: theme.card },
              ]}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: "bold",
                }}
              >
                {isDark ? "☀ Light" : "☾ Dark"}
              </Text>
            </Pressable>
          </View>

          <Text
            style={[
              styles.subtitle,
              { color: theme.muted },
            ]}
          >
            Your personal finance manager
          </Text>

          {activeTab === "Home" && (
            <>
              <View
                style={[
                  styles.totalCard,
                  { backgroundColor: theme.card },
                ]}
              >
                <Text style={{ color: theme.muted }}>
                  Total Spending
                </Text>

                <Text
                  style={[
                    styles.amount,
                    { color: theme.text },
                  ]}
                >
                  {money(total)}
                </Text>
              </View>

              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text },
                ]}
              >
                Spending by Category
              </Text>

              {renderCategoryChart()}

              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text },
                ]}
              >
                Recent Receipts
              </Text>

              {renderReceipts()}
            </>
          )}

          {activeTab === "Statistics" && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text },
                ]}
              >
                Statistics
              </Text>

              {renderMonthlyChart()}

              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text },
                ]}
              >
                Spending by Category
              </Text>

              {renderCategoryChart()}
            </>
          )}

          {activeTab === "History" && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text },
                ]}
              >
                Receipt History
              </Text>

              {renderReceipts()}
            </>
          )}

          {activeTab === "Scan" && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text },
                ]}
              >
                Scan Receipt
              </Text>

              <Pressable
                onPress={addTestReceipt}
                disabled={loading}
                style={[
                  styles.addButton,
                  { backgroundColor: theme.accent },
                ]}
              >
                <Text style={styles.addButtonText}>
                  Add Test Receipt
                </Text>
              </Pressable>

              {storageError ? (
                <Text style={styles.errorText}>
                  {storageError}
                </Text>
              ) : null}

              <View
                style={[
                  styles.scanCard,
                  { backgroundColor: theme.card },
                ]}
              >
                <Text
                  style={[
                    styles.scanIcon,
                    { color: theme.accent },
                  ]}
                >
                  ▣
                </Text>

                <Text
                  style={[
                    styles.scanTitle,
                    { color: theme.text },
                  ]}
                >
                  Receipt Scanner
                </Text>

                <Text
                  style={[
                    styles.scanDescription,
                    { color: theme.muted },
                  ]}
                >
                  Camera scanning will be connected
                  to the receipt recognition module.
                </Text>

                <Text
                  style={{
                    color: theme.accent,
                    fontWeight: "bold",
                  }}
                >
                  Scanner integration pending
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View
        style={[
          styles.navigation,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
          },
        ]}
      >
        {(["Home", "Statistics", "History", "Scan"] as Tab[]).map(
          (tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.navButton,
                activeTab === tab && {
                  backgroundColor: theme.active,
                },
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  {
                    color:
                      activeTab === tab
                        ? theme.accent
                        : theme.muted,
                  },
                ]}
              >
                {tab === "Home"
                  ? "⌂"
                  : tab === "Statistics"
                  ? "▥"
                  : tab === "History"
                  ? "▤"
                  : "▣"}
              </Text>

              <Text
                style={[
                  styles.navText,
                  {
                    color:
                      activeTab === tab
                        ? theme.accent
                        : theme.muted,
                    fontWeight:
                      activeTab === tab
                        ? "bold"
                        : "normal",
                  },
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    padding: 20,
    paddingTop: 45,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 30,
  },
  totalCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 25,
  },
  amount: {
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 10,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  chartContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  chartCenter: {
    position: "absolute",
    alignItems: "center",
  },
  chartAmount: {
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 4,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendName: {
    flex: 1,
    fontSize: 14,
  },
  legendAmount: {
    fontSize: 14,
    marginRight: 12,
  },
  percent: {
    width: 48,
    textAlign: "right",
    fontSize: 12,
  },
  receipt: {
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  store: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  arrow: {
    fontSize: 24,
    marginLeft: 12,
  },
  itemsContainer: {
    borderTopWidth: 1,
    paddingTop: 15,
    marginTop: 15,
  },
  itemsTitle: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  itemName: {
    fontSize: 15,
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: "#7F1D1D",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  deleteText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 12,
  },
  barColumn: {
    width: 100,
    alignItems: "center",
  },
  barValue: {
    fontSize: 12,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  scanCard: {
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
  },
  scanIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  scanDescription: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#10141D",
    fontWeight: "bold",
  },
  errorText: {
    color: "#FB7185",
    marginBottom: 16,
  },
  navigation: {
    flexDirection: "row",
    borderTopWidth: 1,
    padding: 8,
    justifyContent: "space-around",
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 11,
  },
});
