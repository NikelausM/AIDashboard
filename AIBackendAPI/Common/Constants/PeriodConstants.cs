namespace AIBackendAPI.Common.Constants
{
    public static class PeriodConstants
    {
        public const string All = "all";
        public const string Last7Days = "last_7_days";
        public const string LastMonth = "last_month";
        public const string Last3Months = "last_3_months";
        public const string LastYear = "last_year";
        public static readonly string[] AllConstants = [All, Last7Days, LastMonth, Last3Months, LastYear];
    }
}
