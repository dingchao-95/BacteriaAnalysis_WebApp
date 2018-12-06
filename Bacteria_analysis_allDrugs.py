
import warnings
warnings.filterwarnings('ignore')
from scipy.stats import ttest_ind
from scipy import stats
import pandas as pd, numpy as np
import scipy
import seaborn as sns
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.cm as cm
from glob import glob
from os import path
from ipywidgets import interact
from statsmodels.robust import scale
from statsmodels.sandbox.stats import multicomp
from matplotlib import gridspec
from statsmodels.sandbox.stats.multicomp import multipletests
from numpy import sqrt, abs
from scipy.stats import norm

import time
import warnings
warnings.simplefilter(action="ignore", category=DeprecationWarning)

if __name__ == '__main__':
    print('')
    print("Volcano plot for bacterial intensity")
    print('')


    counts_pd_UN_IN = pd.read_csv("C:/Users/Win10/Downloads/Re%3a_Student_Attachment/Bacteria_Pvals_allDrugs_STREPworking_Area_Int_sum.csv")
    
    counts_pd_UN_IN = counts_pd_UN_IN.set_index('Unnamed: 0', drop=True)
    rej, p_corr, aS, aB = multipletests(counts_pd_UN_IN['p-value_Area'].values.flatten(), alpha=0.05, method='fdr_tsbky')
    counts_pd_UN_IN['p-value_Area'] = -np.log(np.array(p_corr, dtype=np.float32))
    rej, p_corr, aS, aB = multipletests(counts_pd_UN_IN['p-value_IntegInt'].values.flatten(), alpha=0.05, method='fdr_tsbky')
    counts_pd_UN_IN['p-value_IntegInt'] = -np.log(np.array(p_corr, dtype=np.float32))


    feat = 'Perc change_IntegInt'
    pval = 'p-value_IntegInt'
    pvals_pd = counts_pd_UN_IN


    Area_STREP_mean = counts_pd_UN_IN[counts_pd_UN_IN.index.str.startswith('STREP')][feat].mean()

    plt.subplots(figsize=(20,15))



    for i, txt in enumerate(pvals_pd.index.values):
    #print(txt)

    
    #elif pvals_pd['p-value_Bact'].values[i] < -np.log(0.05):
        if (pvals_pd[feat].values[i] < 0.5*Area_STREP_mean) & (pvals_pd[pval].values[i] > -np.log(0.05)):    
            plt.scatter(pvals_pd[feat].values[i], pvals_pd[pval].values[i], color='green', s=50)    
        elif (pvals_pd[feat].values[i] < 0.5*Area_STREP_mean) & (pvals_pd[pval].values[i] < -np.log(0.05)):    
            plt.scatter(pvals_pd[feat].values[i], pvals_pd[pval].values[i], color='grey', s=50)  
           

        elif (pvals_pd[feat].values[i] > -0.5*Area_STREP_mean) & (pvals_pd[pval].values[i] > -np.log(0.05)):    
            plt.scatter(pvals_pd[feat].values[i], pvals_pd[pval].values[i], color='red', s=50) 
        elif (pvals_pd[feat].values[i] > -0.5*Area_STREP_mean) & (pvals_pd[pval].values[i] < -np.log(0.05)):    
            plt.scatter(pvals_pd[feat].values[i], pvals_pd[pval].values[i], color='grey', s=50)
    
        else:
            plt.scatter(pvals_pd[feat].values[i], pvals_pd[pval].values[i], color='black', s=50)
           
                
    plt.axvline(x=0, linewidth=1, color='k')    
    plt.axhline(y=-np.log(0.05), linewidth=2, linestyle='--', color='k')  
    plt.axvline(x=0.5*Area_STREP_mean, linewidth=2, linestyle='--', color='g')   
    plt.axvline(x=-0.5*Area_STREP_mean, linewidth=2, linestyle='--', color='g')   
    plt.xlabel('Mean change in Bacterial Intensity wrt DMSO (%)', fontsize=20)
    plt.ylabel('-log(Adjusted P-value)', fontsize=20)
    plt.savefig("Bact_IntegInt_allDrugs_STREPworking.jpg")

