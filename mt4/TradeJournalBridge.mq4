#property strict
#property copyright "TradeJournal Pro"
#property version   "1.00"

input int PollSeconds = 10;
input int LookbackDays = 3650;

string FolderName = "TradeJournalPro";

int OnInit()
{
   FolderCreate(FolderName, FILE_COMMON);
   EventSetTimer(MathMax(1, PollSeconds));
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   EventKillTimer();
}

void OnTimer()
{
   WriteSnapshot();
   WriteClosedTrades();
}

string IsoTime(datetime value)
{
   return TimeToString(value, TIME_DATE | TIME_SECONDS);
}

string JsonEscape(string value)
{
   StringReplace(value, "\\", "\\\\");
   StringReplace(value, "\"", "\\\"");
   return value;
}

string AccountJson()
{
   return "\"account\":{\"login\":\"" + IntegerToString(AccountNumber()) +
      "\",\"server\":\"" + JsonEscape(AccountServer()) +
      "\",\"broker\":\"" + JsonEscape(AccountCompany()) +
      "\",\"currency\":\"" + JsonEscape(AccountCurrency()) + "\"}";
}

int OpenAppendFile()
{
   string fileName = FolderName + "\\mt4_" + IntegerToString(AccountNumber()) + ".jsonl";
   int handle = FileOpen(fileName, FILE_READ | FILE_WRITE | FILE_TXT | FILE_COMMON);
   if(handle == INVALID_HANDLE)
      return INVALID_HANDLE;
   FileSeek(handle, 0, SEEK_END);
   return handle;
}

void WriteSnapshot()
{
   int handle = OpenAppendFile();
   if(handle == INVALID_HANDLE)
      return;

   double floating = AccountEquity() - AccountBalance();
   string line = "{\"type\":\"snapshot\"," + AccountJson() +
      ",\"snapshot\":{\"balance\":" + DoubleToString(AccountBalance(), 2) +
      ",\"equity\":" + DoubleToString(AccountEquity(), 2) +
      ",\"floating_pl\":" + DoubleToString(floating, 2) +
      ",\"margin\":" + DoubleToString(AccountMargin(), 2) +
      ",\"free_margin\":" + DoubleToString(AccountFreeMargin(), 2) +
      ",\"timestamp\":\"" + IsoTime(TimeCurrent()) + "\"}}";
   FileWriteString(handle, line + "\r\n");
   FileClose(handle);
}

void WriteClosedTrades()
{
   string gvName = "TJP_LAST_CLOSE_" + IntegerToString(AccountNumber());
   datetime lastClose = 0;
   if(GlobalVariableCheck(gvName))
      lastClose = (datetime)GlobalVariableGet(gvName);
   datetime maxClose = lastClose;
   datetime lookback = TimeCurrent() - LookbackDays * 86400;

   int handle = OpenAppendFile();
   if(handle == INVALID_HANDLE)
      return;

   for(int i = 0; i < OrdersHistoryTotal(); i++)
   {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
         continue;
      if(OrderType() != OP_BUY && OrderType() != OP_SELL)
         continue;
      if(OrderCloseTime() <= 0 || OrderCloseTime() < lookback)
         continue;
      if(OrderCloseTime() < lastClose)
         continue;

      string line = "{\"type\":\"trade\"," + AccountJson() +
         ",\"trade\":{\"ticket\":\"" + IntegerToString(OrderTicket()) +
         "\",\"symbol\":\"" + JsonEscape(OrderSymbol()) +
         "\",\"volume\":" + DoubleToString(OrderLots(), 2) +
         ",\"profit\":" + DoubleToString(OrderProfit(), 2) +
         ",\"swap\":" + DoubleToString(OrderSwap(), 2) +
         ",\"commission\":" + DoubleToString(OrderCommission(), 2) +
         ",\"open_time\":\"" + IsoTime(OrderOpenTime()) +
         "\",\"close_time\":\"" + IsoTime(OrderCloseTime()) + "\"}}";
      FileWriteString(handle, line + "\r\n");
      if(OrderCloseTime() > maxClose)
         maxClose = OrderCloseTime();
   }

   FileClose(handle);
   if(maxClose > lastClose)
      GlobalVariableSet(gvName, maxClose);
}
